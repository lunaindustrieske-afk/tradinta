
'use server';
import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import { type Product, type Manufacturer } from './definitions';

// Initialize Firebase Admin SDK
customInitApp();
const db = getFirestore();

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

type ProductWithShopId = Product & { shopId: string };
/**
 * Fetches all published products and their manufacturer's shopId.
 * This function runs on the server and uses the Admin SDK.
 */
export async function getAllProducts(): Promise<ProductWithShopId[]> {
  try {
    // 1. Fetch all manufacturers and create a map of UID to shopId
    const manufCollection = db.collection('manufacturers');
    const manufSnapshot = await manufCollection.get();
    const manufMap = new Map<string, string>();
    manufSnapshot.forEach(doc => {
      const data = doc.data() as Manufacturer;
      if (data.shopId) {
        manufMap.set(doc.id, data.shopId);
      }
    });

    // 2. Fetch all products using a collection group query
    const productsQuery = db.collectionGroup('products').where('status', '==', 'published');
    const productSnapshot = await productsQuery.get();
    
    const productsData = productSnapshot.docs.map(doc => {
      const product = doc.data() as Product;
      const shopId = manufMap.get(product.manufacturerId) || '';
      return {
        ...product,
        id: doc.id,
        shopId: shopId,
      };
    }).filter(p => p.shopId); // Only include products where a shopId could be found

    return productsData;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}
