
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Upload,
  Globe,
  Link as LinkIcon,
  Save,
  Building,
  FileText,
  ShieldCheck,
  Banknote,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function EditShopProfilePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboards/seller-centre">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Shop Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboards/seller-centre">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Edit Shop Profile
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Shop Branding</CardTitle>
              <CardDescription>
                Customize your shop's appearance to stand out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Label>Shop Logo</Label>
                  <div className="mt-2 relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted">
                    <Image
                      src="https://picsum.photos/seed/mfg1/128/128"
                      alt="Shop Logo"
                      fill
                      className="object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow">
                  <Label>Shop Banner</Label>
                  <div className="mt-2 relative aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted">
                    <Image
                      src="https://picsum.photos/seed/mfg1-cover/1600/400"
                      alt="Shop Banner"
                      fill
                      className="object-cover rounded-md"
                    />
                     <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
               <div className="grid gap-3">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input id="shop-name" defaultValue="Constructa Ltd" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shop-tagline">Shop Tagline</Label>
                  <Input id="shop-tagline" placeholder="e.g., Quality Building Materials for East Africa" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shop-description">Shop Description</Label>
                  <Textarea id="shop-description" className="min-h-32" placeholder="Tell buyers about your business..." defaultValue="Constructa Ltd is a leading supplier of high-quality building materials in East Africa. Established in 2010, we are committed to providing durable and reliable products for construction projects of all sizes." />
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Provide your official business details.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="biz-reg-no">Business Registration No.</Label>
                    <Input id="biz-reg-no" defaultValue="BN-12345678" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="kra-pin">KRA PIN</Label>
                    <Input id="kra-pin" defaultValue="A001234567B" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="biz-address">Physical Address</Label>
                    <Input id="biz-address" defaultValue="Industrial Area, Nairobi, Kenya" />
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="biz-phone">Business Phone</Label>
                    <Input id="biz-phone" type="tel" defaultValue="+254 712 345 678" />
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Policies</CardTitle>
                <CardDescription>Define your payment, shipping, and return policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="payment-policy">Payment Policy</Label>
                  <Textarea id="payment-policy" placeholder="e.g., We accept TradPay, Bank Transfer, and LPO for approved clients. Payment is due upon order confirmation." />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shipping-policy">Shipping Policy</Label>
                  <Textarea id="shipping-policy" placeholder="e.g., We ship within 3-5 business days. Delivery fees vary by location." />
                </div>
                 <div className="grid gap-3">
                  <Label htmlFor="return-policy">Return Policy</Label>
                  <Textarea id="return-policy" placeholder="e.g., Returns accepted within 7 days for defective products only. Buyer is responsible for return shipping." />
                </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar Column */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>Upload required documents to get the "Verified" badge.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <p className="font-semibold text-sm">Certificate of Incorporation</p>
                        </div>
                        <Button variant="outline" size="sm">Upload</Button>
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <p className="font-semibold text-sm">KRA PIN Certificate</p>
                        </div>
                        <Badge variant="secondary">Uploaded</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid gap-3">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="website" className="pl-8" placeholder="https://..." />
                        </div>
                    </div>
                     <div className="grid gap-3">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                         <div className="relative">
                            <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="linkedin" className="pl-8" placeholder="linkedin.com/company/..." />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shop Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="tradpay-switch" className="flex flex-col gap-1">
                            <span>Accept TradPay</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable secure escrow payments.</span>
                        </Label>
                        <Switch id="tradpay-switch" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="tradpoints-switch" className="flex flex-col gap-1">
                            <span>Issue TradPoints</span>
                            <span className="font-normal text-xs text-muted-foreground">Reward buyers for purchases.</span>
                        </Label>
                        <Switch id="tradpoints-switch" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <div className="flex items-center justify-end gap-2 md:hidden mt-6">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
    </div>
  );
}
