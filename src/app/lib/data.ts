
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
 * Fetches all published products from all manufacturers.
 * This requires a composite index on products(status, createdAt).
 */
export async function getAllProducts(): Promise<any[]> {
  try {
    // 1. Get all published products using a collection group query.
    // This is more efficient as it doesn't require fetching all manufacturers first.
    const productsSnapshot = await db
      .collectionGroup('products')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
      
    if (productsSnapshot.empty) {
        console.log("No published products found in collection group query.");
        return [];
    }

    // 2. Extract manufacturer IDs from the product paths.
    const manufacturerIds = new Set<string>();
    productsSnapshot.docs.forEach(doc => {
        const manufId = doc.ref.parent.parent?.id;
        if (manufId) {
            manufacturerIds.add(manufId);
        }
    });

    // 3. Fetch the required data for these manufacturers in a single batch (if possible).
    // Firestore `in` query is limited to 30 items. For more, multiple queries are needed.
    const manufMap = new Map<string, ManufacturerInfo>();
    if (manufacturerIds.size > 0) {
        const manufCollection = db.collection('manufacturers');
        const manufSnapshot = await manufCollection.where('__name__', 'in', Array.from(manufacturerIds)).get();
        manufSnapshot.forEach(doc => {
            const data = doc.data() as Manufacturer;
            if (!data.suspensionDetails?.isSuspended) { // Check suspension here
                manufMap.set(doc.id, {
                    slug: data.slug,
                    shopId: data.shopId,
                    isVerified: data.verificationStatus === 'Verified',
                });
            }
        });
    }

    // 4. Combine product data with manufacturer data.
    const allProducts = productsSnapshot.docs
      .map(doc => {
        const productData = doc.data() as Product;
        const manufId = doc.ref.parent.parent?.id;
        if (!manufId || !manufMap.has(manufId)) {
          // This product belongs to a suspended manufacturer, so we filter it out.
          return null;
        }
        const manufInfo = manufMap.get(manufId)!;

        // Sanitize Timestamps to ISO strings
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
            manufacturerId: manufId, // Ensure manufacturerId is present
            manufacturerSlug: manufInfo.slug,
            shopId: manufInfo.shopId,
            isVerified: manufInfo.isVerified,
        };
      })
      .filter(p => p !== null); // Remove nulls (products from suspended shops)

    return allProducts;

  } catch (error) {
    console.error("Error fetching all products:", error);
    // This error might indicate a missing index. Advise the user.
    if ((error as any).code === 'FAILED_PRECONDITION') {
        console.error("Firestore error: This query requires an index. Please check your `firestore.indexes.json` file or create the index in the Firebase console for the 'products' collection group.");
    }
    return [];
  }
}
