
import { getAllProducts } from '@/app/lib/data';
import { ProductsPageClient } from './products-page-client';
import { type Product } from '@/lib/definitions';

type ProductWithShopId = Product & { shopId: string; slug: string; };

export default async function ProductsPage() {
  // Fetch initial products on the server for faster first load.
  // The client component can then re-fetch this data.
  const initialProducts: ProductWithShopId[] = await getAllProducts();

  return <ProductsPageClient initialProducts={initialProducts} />;
}
