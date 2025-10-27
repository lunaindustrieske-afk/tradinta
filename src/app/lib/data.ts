
'use server';
import { getDb } from '@/lib/firebase-admin';
import { type Product, type Manufacturer } from './definitions';

const db = getDb();

// Define types for our data
type HomepageBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  publishedAt: any;
};

/**
 * Fetches published homepage banners from Firestore, ordered by the 'order' field.
 * This function runs on the server and uses the Admin SDK, bypassing security rules.
 */
export async function getHomepageBanners(): Promise<HomepageBanner[]> {
  try {
    const bannersSnapshot = await db
      .collection('homepageBanners')
      .where('status', '==', 'published')
      .orderBy('order', 'asc')
      .get();

    if (bannersSnapshot.empty) {
      return [];
    }

    return bannersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as HomepageBanner));
  } catch (error) {
    console.error("Error fetching homepage banners:", error);
    // In a real application, you might want to log this to a proper logging service.
    // For now, we return an empty array to prevent the page from crashing.
    return [];
  }
}

/**
 * Fetches all published blog posts from Firestore.
 * This function runs on the server and uses the Admin SDK, bypassing security rules.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
    try {
        const postsSnapshot = await db
            .collection('blogPosts')
            .where('status', '==', 'published')
            .orderBy('publishedAt', 'desc')
            .get();

        if (postsSnapshot.empty) {
            return [];
        }

        return postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BlogPost));

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
}

/**
 * Fetches a single blog post by its slug.
 * This function runs on the server and uses the Admin SDK.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const postQuery = db.collection('blogPosts').where('slug', '==', slug).limit(1);
        const querySnapshot = await postQuery.get();

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as BlogPost;
    } catch (error) {
        console.error(`Error fetching blog post by slug (${slug}):`, error);
        return null;
    }
}

type ProductWithShopId = Product & { shopId: string; slug: string; };

type ManufacturerInfo = {
  slug: string;
  shopId: string;
  isVerified: boolean;
  suspensionDetails?: { isSuspended?: boolean };
};

/**
 * Fetches all published products and their manufacturer's shopId.
 * This function runs on the server and uses the Admin SDK.
 */
export async function getAllProducts(): Promise<any[]> {
  try {
    // Fetch all manufacturers and create a map of their relevant info
    const manufCollection = db.collection('manufacturers');
    const manufSnapshot = await manufCollection.get();
    const manufMap = new Map<string, ManufacturerInfo>();

    manufSnapshot.forEach(doc => {
      const data = doc.data() as Manufacturer;
      // Only include manufacturers who are not suspended
      if (data.slug && data.shopId && !data.suspensionDetails?.isSuspended) {
        manufMap.set(doc.id, { 
          slug: data.slug,
          shopId: data.shopId,
          isVerified: data.verificationStatus === 'Verified',
          suspensionDetails: data.suspensionDetails,
        });
      }
    });

    // Query for all published products
    const productsQuery = db.collectionGroup('products')
      .where('status', '==', 'published');
      // We can't orderBy createdAt here because it would require a composite index with manufacturerId,
      // which we don't have since it's a collectionGroup query. We will sort in the application code.
      
    const productSnapshot = await productsQuery.get();
    
    const productsData = productSnapshot.docs
      .map(doc => {
        const productData = doc.data();
        const manufInfo = manufMap.get(productData.manufacturerId);

        // If the manufacturer is not in our map (e.g., they are suspended or have no slug/shopId), filter out this product
        if (!manufInfo) {
          return null;
        }

        // Sanitize Firestore Timestamps to strings for client component compatibility
        const sanitizedData: { [key: string]: any } = {};
        for (const key in productData) {
          const value = productData[key];
          if (value && typeof value.toDate === 'function') {
            sanitizedData[key] = value.toDate().toISOString();
          } else {
            sanitizedData[key] = value;
          }
        }
        
        return {
          ...sanitizedData,
          id: doc.id,
          slug: manufInfo.slug,
          shopId: manufInfo.shopId,
          isVerified: manufInfo.isVerified,
        };
      })
      .filter(Boolean); // This removes any null entries from the map step

    // Sort by creation date descending in code
    productsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });

    return productsData;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}
