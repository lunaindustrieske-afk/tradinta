
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
 * Fetches all published products from all non-suspended manufacturers.
 * This function uses a collection group query and requires a composite index in Firestore.
 */
export async function getAllProducts(): Promise<any[]> {
  try {
    // 1. Fetch all manufacturers and create a map of their status.
    const manufCollection = db.collection('manufacturers');
    const manufSnapshot = await manufCollection.get();
    
    const manufMap = new Map<string, ManufacturerInfo>();
    manufSnapshot.forEach(doc => {
      const data = doc.data() as Manufacturer;
      manufMap.set(doc.id, { 
        slug: data.slug,
        shopId: data.shopId,
        isVerified: data.verificationStatus === 'Verified',
        suspensionDetails: data.suspensionDetails 
      });
    });

    // 2. Query all published products across all sellers.
    const productsQuery = db.collectionGroup('products')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc');
    
    const productSnapshot = await productsQuery.get();
    
    // 3. Filter out products from suspended manufacturers and map data.
    const productsData = productSnapshot.docs
      .map(doc => {
        const productData = doc.data();
        const manufInfo = manufMap.get(productData.manufacturerId);

        // Filter out products where the manufacturer is suspended or doesn't exist in the map
        if (!manufInfo || manufInfo.suspensionDetails?.isSuspended) {
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
      .filter(p => p !== null); // Remove null entries from the filtered list

    return productsData;

  } catch (error) {
    console.error("Error fetching all products:", error);
    // Re-throw the error to be caught by Next.js error boundaries
    // This will help surface the index creation link if that's the issue.
    throw error;
  }
}
