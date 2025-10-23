import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { products } from '@/app/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const categories = [
  ...new Set(products.map((product) => product.category)),
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <section className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
        <Image
          src="https://picsum.photos/seed/hero/1600/900"
          alt="Manufacturing Hub"
          fill
          className="object-cover"
          data-ai-hint="industrial manufacturing"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-headline">
            Powering Africa’s Manufacturers
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground max-w-2xl mb-8">
            The leading B2B marketplace connecting manufacturers with suppliers and buyers across the continent.
          </p>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, materials, or suppliers..."
                className="w-full rounded-full pl-10 pr-4 py-3 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 font-headline">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link href="#" key={category}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="font-semibold">{category}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-headline">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link href="/products">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    data-ai-hint={product.imageHint}
                  />
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <CardTitle className="text-lg mb-1 truncate">{product.name}</CardTitle>
                  <CardDescription className="text-base font-bold text-primary">
                    KES {product.price.toLocaleString()}
                  </CardDescription>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">View Product</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
