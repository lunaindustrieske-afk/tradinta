
import { getAllProducts } from '@/app/lib/data';
import { ProductsPageClient } from './products-page-client';
import { type Product } from '@/lib/definitions';

type ProductWithShopId = Product & { shopId: string };

export default async function ProductsPage() {
  const initialProducts: ProductWithShopId[] = await getAllProducts();

  return <ProductsPageClient initialProducts={initialProducts} />;
}
