
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
  console.log("--- Starting getAllProducts ---");
  try {
    // 1. Fetch all manufacturers and create a map of their status.
    const manufCollection = db.collection('manufacturers');
    const manufSnapshot = await manufCollection.get();
    console.log(`Found ${manufSnapshot.size} total manufacturers.`);
    
    const manufMap = new Map<string, ManufacturerInfo>();
    const nonSuspendedManufIds: string[] = [];

    manufSnapshot.forEach(doc => {
      const data = doc.data() as Manufacturer;
      if (data.suspensionDetails?.isSuspended) {
        console.log(`- Skipping suspended manufacturer: ${data.shopName || doc.id}`);
        return;
      }
      manufMap.set(doc.id, { 
        slug: data.slug,
        shopId: data.shopId,
        isVerified: data.verificationStatus === 'Verified',
        suspensionDetails: data.suspensionDetails 
      });
      nonSuspendedManufIds.push(doc.id);
    });

    console.log(`Found ${nonSuspendedManufIds.length} non-suspended manufacturers.`);

    if (nonSuspendedManufIds.length === 0) {
        console.log("No non-suspended manufacturers found, returning empty product list.");
        return [];
    }

    // 2. Fetch products for each non-suspended manufacturer
    const allProductsPromises = nonSuspendedManufIds.map(async (manufId) => {
      const productsQuery = db.collection('manufacturers').doc(manufId).collection('products').where('status', '==', 'published');
      const productSnapshot = await productsQuery.get();
      console.log(`-- Found ${productSnapshot.size} published products for manufacturer ${manufId}`);
      
      const manufInfo = manufMap.get(manufId);
      if (!manufInfo) return [];

      return productSnapshot.docs.map(doc => {
        const productData = doc.data();
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
      });
    });

    const productsByManufacturer = await Promise.all(allProductsPromises);
    const combinedProducts = productsByManufacturer.flat();

    // 3. Sort products in application code
    combinedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    console.log(`Total combined products to be returned: ${combinedProducts.length}`);
    console.log("--- Finished getAllProducts ---");

    return combinedProducts;

  } catch (error) {
    console.error("Error fetching all products:", error);
    console.log("--- Finished getAllProducts with an error ---");
    // Re-throw the error to be caught by Next.js error boundaries
    // This will help surface the index creation link if that's the issue.
    throw error;
  }
}

