
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Loader2,
  Save,
  PlusCircle,
  Trash2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Combobox } from '@/components/ui/combobox';

// Mock data
const mockProducts = [
  { value: 'prod-1', label: 'Industrial Grade Cement' },
  { value: 'prod-2', label: 'Commercial Baking Flour' },
];

const mockPartners = [
  { value: 'partner-1', label: 'John Doe (15k Followers)' },
  { value: 'partner-2', label: 'Jane Smith (50k Followers)' },
];

const MarginHelper = ({ unitCost, tiers }: { unitCost: number, tiers: { price: number, discount: number }[] }) => {
    if (unitCost <= 0) return null;

    return (
        <div className="space-y-2 rounded-md bg-muted p-4">
            <h4 className="text-sm font-semibold">Margin Helper</h4>
            {tiers.map((tier, index) => {
                if (tier.price <= 0) return null;
                const discountedPrice = tier.price * (1 - tier.discount / 100);
                const profit = discountedPrice - unitCost;
                const margin = (profit / discountedPrice) * 100;
                return (
                    <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Tier {index + 1} ({tier.discount}%)</span>
                        <span className={margin > 0 ? 'text-green-600' : 'text-destructive'}>
                            Profit: KES {profit.toFixed(2)} ({margin.toFixed(1)}%)
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default function ProposeForgingEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // State for the form
  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [selectedPartner, setSelectedPartner] = React.useState('');
  const [commission, setCommission] = React.useState(5);
  const [duration, setDuration] = React.useState(72);
  const [unitCost, setUnitCost] = React.useState(0);
  const [tiers, setTiers] = React.useState([
    { buyers: 10, discount: 10, price: 0 },
  ]);

  const handleAddTier = () => {
    setTiers([...tiers, { buyers: 0, discount: 0, price: 0 }]);
  };

  const handleTierChange = (index: number, field: 'buyers' | 'discount' | 'price', value: number) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };
  
  const handleRemoveTier = (index: number) => {
      setTiers(tiers.filter((_, i) => i !== index));
  }

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        toast({
            title: "Proposal Sent!",
            description: `Your proposal has been sent to ${mockPartners.find(p => p.value === selectedPartner)?.label}.`
        });
        setIsSubmitting(false);
        router.push('/dashboards/seller-centre/foundry');
      }, 1500);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboards/seller-centre">Seller Centre</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboards/seller-centre/foundry">The Foundry</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Propose Event</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboards/seller-centre/foundry">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Propose a New Forging Event
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Send Proposal
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Core Details</CardTitle>
                    <CardDescription>Select the product and partner for this event.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                     <div className="grid gap-2">
                        <Label>Product to Promote</Label>
                        <Combobox options={mockProducts} value={selectedProduct} onValueChange={setSelectedProduct} placeholder="Select a product..." />
                    </div>
                     <div className="grid gap-2">
                        <Label>Growth Partner</Label>
                        <Combobox options={mockPartners} value={selectedPartner} onValueChange={setSelectedPartner} placeholder="Select a partner..." />
                    </div>
                </CardContent>
             </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Discount Tiers</CardTitle>
                    <CardDescription>Define the buyer thresholds to unlock higher discounts for everyone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tiers.map((tier, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 border rounded-md relative">
                             <div className="grid gap-1.5 flex-grow">
                                <Label htmlFor={`buyers-${index}`}>If we get</Label>
                                <div className="relative">
                                    <Input id={`buyers-${index}`} type="number" value={tier.buyers || ''} onChange={e => handleTierChange(index, 'buyers', Number(e.target.value))} placeholder="e.g. 10"/>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">buyers</span>
                                </div>
                            </div>
                            <div className="grid gap-1.5 flex-grow">
                                <Label htmlFor={`discount-${index}`}>unlock</Label>
                                <div className="relative">
                                     <Input id={`discount-${index}`} type="number" value={tier.discount || ''} onChange={e => handleTierChange(index, 'discount', Number(e.target.value))} placeholder="e.g. 15" />
                                     <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            {tiers.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 absolute -top-3 -right-3" onClick={() => handleRemoveTier(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                        </div>
                    ))}
                    <Button variant="outline" onClick={handleAddTier}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>Deal Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="commission">Partner Commission (%)</Label>
                        <Input id="commission" type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="duration">Event Duration (hours)</Label>
                        <Input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp />Margin Helper</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="unitCost">Your Unit Cost (KES)</Label>
                        <Input id="unitCost" type="number" placeholder="Enter your cost per item" onChange={e => setUnitCost(Number(e.target.value))} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="price">B2B Price (for calculation)</Label>
                        <Input id="price" type="number" placeholder="Product's B2B price" onChange={e => setTiers(tiers.map(t => ({...t, price: Number(e.target.value)})))} />
                    </div>
                    <MarginHelper unitCost={unitCost} tiers={tiers} />
                </CardContent>
            </Card>
        </div>
      </form>
    </div>
  );
}
