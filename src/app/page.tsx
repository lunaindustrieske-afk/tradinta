
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Truck,
  BarChart,
  Coins,
  Building,
} from 'lucide-react';
import { products } from '@/app/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopNav } from '@/components/top-nav';
import { Logo } from '@/components/logo';

const categories = [
  'Packaging',
  'Chemicals',
  'Construction',
  'Beauty',
  'Food & Beverage',
  'Electrical',
  'Textiles',
  'Plastics & Polymers',
];

const valueHighlights = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Verified Manufacturers',
    description: 'Connect with trusted, vetted partners.',
  },
  {
    icon: <Lock className="h-10 w-10 text-primary" />,
    title: 'Secure Payments via TradPay',
    description: 'Transact with confidence using our escrow system.',
  },
  {
    icon: <Truck className="h-10 w-10 text-primary" />,
    title: 'Reliable Logistics',
    description: 'Seamless delivery across the continent.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Marketing Tools for Growth',
    description: 'Amplify your reach and boost your sales.',
  },
  {
    icon: <Coins className="h-10 w-10 text-primary" />,
    title: 'Powered by TradCoin',
    description: 'Earn rewards and incentives on every transaction.',
  },
];

const featuredManufacturers = [
  {
    name: 'Constructa Ltd',
    industry: 'Building Materials',
    logo: 'https://picsum.photos/seed/mfg1/48/48',
  },
  {
    name: 'SuperBake Bakery',
    industry: 'Food & Beverage',
    logo: 'https://picsum.photos/seed/mfg2/48/48',
  },
  {
    name: 'PlastiCo Kenya',
    industry: 'Plastics & Polymers',
    logo: 'https://picsum.photos/seed/mfg3/48/48',
  },
  {
    name: 'PrintPack Solutions',
    industry: 'Packaging',
    logo: 'https://picsum.photos/seed/mfg4/48/48',
  },
];

const trustMetrics = [
    { value: '1,200+', label: 'Verified Businesses' },
    { value: '10,000+', label: 'B2B Transactions' },
    { value: 'KES 80M+', label: 'Processed via TradPay' },
    { value: '4.8/5', label: 'Manufacturer Satisfaction' },
];

const blogPosts = [
    {
        title: 'Kenya’s Manufacturing Trends 2025',
        link: '#'
    },
    {
        title: 'How to Digitize Your Factory Sales for Growth',
        link: '#'
    },
    {
        title: 'The Future of B2B Logistics in Africa',
        link: '#'
    }
]

export default function HomePage() {
  return (
    <>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-12 md:gap-20">
          {/* 1. Hero Section */}
          <section className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden -mt-8 -mx-4">
            <Image
              src="https://picsum.photos/seed/hero-trade/1600/900"
              alt="African trade and manufacturing"
              fill
              className="object-cover"
              data-ai-hint="industrial trade logistics"
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-headline">
                Powering Africa’s Manufacturers — Buy Direct. Sell Smart.
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground max-w-3xl mb-8">
                Tradinta connects verified manufacturers, distributors, and buyers
                across Africa with secure payments and marketing tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Open a Manufacturer Shop</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/products">Explore Verified Products</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* 2. Key Value Highlights */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {valueHighlights.map((highlight) => (
              <div key={highlight.title} className="flex flex-col items-center gap-2">
                {highlight.icon}
                <h3 className="font-semibold">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            ))}
          </section>

          {/* 3. Featured Categories / Products */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center font-headline">
              Featured Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link href="#" key={category}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex items-center justify-center text-center h-24">
                      <div className="font-semibold">{category}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold font-headline">Featured Products</h2>
              <Button variant="outline" asChild>
                <Link href="/products">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                   <Link href={`/products/${product.manufacturerId}/${product.slug}`}>
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          data-ai-hint={product.imageHint}
                        />
                        <Badge variant="secondary" className="absolute top-2 left-2">Verified Factory</Badge>
                      </div>
                      <div className="p-4">
                        <CardTitle className="text-lg mb-1 truncate">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-base font-bold text-primary">
                          KES {product.price.toLocaleString()}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          {/* 4. Manufacturer Spotlight */}
          <section className="bg-muted py-12 rounded-lg -mx-4 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center font-headline">Featured Manufacturers</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {featuredManufacturers.map(mfg => (
                        <div key={mfg.name} className="flex flex-col items-center text-center gap-4">
                            <Image src={mfg.logo} alt={mfg.name} width={64} height={64} className="rounded-full" />
                            <div>
                                <h4 className="font-semibold">{mfg.name}</h4>
                                <p className="text-sm text-muted-foreground">{mfg.industry}</p>
                            </div>
                            <Button variant="outline" size="sm">View Shop</Button>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* 5. About Tradinta */}
          <section className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-headline">About Tradinta</h2>
            <p className="text-muted-foreground mb-4">
                Tradinta is Kenya’s first B2B marketplace built exclusively for manufacturers. We help factories, wholesalers, and retailers connect, transact, and grow using digital tools built for Africa’s supply chain.
            </p>
            <Button variant="link" asChild>
                <Link href="#">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </section>

          {/* 6. TradPay & TradCoin Promo */}
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2 font-headline">TradPay</h3>
                <p className="text-muted-foreground mb-4">Secure, instant payments with escrow protection.</p>
                <Button>Try TradPay</Button>
            </Card>
            <Card className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2 font-headline">TradCoin</h3>
                <p className="text-muted-foreground mb-4">Earn, trade, and save with Africa’s first manufacturing token.</p>
                <Button variant="secondary">Learn About TradCoin</Button>
            </Card>
          </section>

          {/* 7. Marketing & Ambassador Highlight */}
          <section className="bg-primary text-primary-foreground rounded-lg p-8 grid md:grid-cols-2 gap-8 items-center">
            <div>
                <h2 className="text-3xl font-bold mb-4 font-headline">Reach 10x More Buyers</h2>
                <p className="mb-4">Our Ambassadors and marketing packages help your factory reach thousands of new buyers across the continent.</p>
                <Button variant="secondary" asChild><Link href="/marketing-plans">Explore Marketing</Link></Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-primary/50 p-4 rounded">
                    <p className="text-2xl font-bold">250+</p>
                    <p>Manufacturers Promoted</p>
                </div>
                <div className="bg-primary/50 p-4 rounded">
                    <p className="text-2xl font-bold">4,000+</p>
                    <p>Leads Generated Monthly</p>
                </div>
            </div>
          </section>

          {/* 8. Metrics / Trust Builders */}
          <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {trustMetrics.map(metric => (
                      <div key={metric.label}>
                          <p className="text-4xl font-bold text-primary">{metric.value}</p>
                          <p className="text-muted-foreground">{metric.label}</p>
                      </div>
                  ))}
              </div>
          </section>

          {/* 9. News / Insights */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center font-headline">News & Insights</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {blogPosts.map(post => (
                    <Card key={post.title} className="p-6">
                        <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={post.link}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </Card>
                ))}
            </div>
            <div className="text-center mt-8">
                <Button variant="outline" asChild>
                    <Link href="#">Visit Tradinta Insights</Link>
                </Button>
            </div>
          </section>

          {/* 10. Call-to-Action Strip */}
          <section className="bg-muted rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join hundreds of manufacturers growing with Tradinta.</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/signup">Register as Manufacturer</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#">Browse Wholesale Offers</Link>
                </Button>
              </div>
          </section>
        </div>
      </div>
      
    </>
  );
}

    