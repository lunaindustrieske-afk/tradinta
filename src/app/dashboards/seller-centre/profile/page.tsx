
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Globe,
  Link as LinkIcon,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';
import { PhotoUpload } from '@/components/photo-upload';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function EditShopProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Form state
  const [shopName, setShopName] = useState('');
  const [shopTagline, setShopTagline] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bizRegNo, setBizRegNo] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [paymentPolicy, setPaymentPolicy] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [kraPinUrl, setKraPinUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [acceptsTradPay, setAcceptsTradPay] = useState(true);
  const [issuesTradPoints, setIssuesTradPoints] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing data
  useEffect(() => {
    if (user && firestore) {
      const fetchManufacturerData = async () => {
        const manufRef = doc(firestore, 'manufacturers', user.uid);
        const docSnap = await getDoc(manufRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShopName(data.shopName || '');
          setShopTagline(data.tagline || '');
          setShopDescription(data.description || '');
          setLogoUrl(data.logoUrl || '');
          setBannerUrl(data.bannerUrl || '');
          setBizRegNo(data.businessLicenseNumber || '');
          setKraPin(data.kraPin || '');
          setBizAddress(data.address || '');
          setBizPhone(data.phone || '');
          setPaymentPolicy(data.paymentPolicy || '');
          setShippingPolicy(data.shippingPolicy || '');
          setReturnPolicy(data.returnPolicy || '');
          setWebsite(data.website || '');
          setLinkedin(data.linkedin || '');
          setAcceptsTradPay(data.acceptsTradPay !== false);
          setIssuesTradPoints(data.issuesTradPoints === true);
          
          if(data.certifications && data.certifications.length > 0) {
             // Assuming for now cert and pin are the only two
             setCertUrl(data.certifications.find((c: string) => c.includes('cert')) || '');
             setKraPinUrl(data.certifications.find((c: string) => c.includes('pin')) || '');
          }
        }
      };
      fetchManufacturerData();
    }
  }, [user, firestore]);

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ title: "Not authenticated", description: "You must be logged in to save changes.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    const manufacturerData = {
      shopName,
      tagline: shopTagline,
      description: shopDescription,
      logoUrl,
      bannerUrl,
      businessLicenseNumber: bizRegNo,
      kraPin,
      address: bizAddress,
      phone: bizPhone,
      paymentPolicy,
      shippingPolicy,
      returnPolicy,
      website,
      linkedin,
      acceptsTradPay,
      issuesTradPoints,
      certifications: [certUrl, kraPinUrl].filter(Boolean), // Store URLs in an array
    };
    
    try {
      const manufRef = doc(firestore, 'manufacturers', user.uid);
      await setDoc(manufRef, manufacturerData, { merge: true });
      toast({
        title: "Profile Updated",
        description: "Your shop profile has been successfully saved.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return <div>Loading...</div>; // Or a proper loading component
  }

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
          <Button size="sm" onClick={handleSaveChanges} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
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
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-32">
                   <PhotoUpload
                    label="Shop Logo"
                    onUpload={setLogoUrl}
                    initialUrl={logoUrl}
                  />
                </div>
                <div className="flex-grow">
                  <PhotoUpload
                    label="Shop Banner"
                    onUpload={setBannerUrl}
                    initialUrl={bannerUrl}
                  />
                </div>
              </div>
               <div className="grid gap-3">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input id="shop-name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shop-tagline">Shop Tagline</Label>
                  <Input id="shop-tagline" placeholder="e.g., Quality Building Materials for East Africa" value={shopTagline} onChange={(e) => setShopTagline(e.target.value)}/>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shop-description">Shop Description</Label>
                  <Textarea id="shop-description" className="min-h-32" placeholder="Tell buyers about your business..." value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} />
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
                    <Input id="biz-reg-no" value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="kra-pin">KRA PIN</Label>
                    <Input id="kra-pin" value={kraPin} onChange={(e) => setKraPin(e.target.value)} />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="biz-address">Physical Address</Label>
                    <Input id="biz-address" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} />
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="biz-phone">Business Phone</Label>
                    <Input id="biz-phone" type="tel" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} />
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
                  <Textarea id="payment-policy" placeholder="e.g., We accept TradPay, Bank Transfer, and LPO for approved clients. Payment is due upon order confirmation." value={paymentPolicy} onChange={(e) => setPaymentPolicy(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="shipping-policy">Shipping Policy</Label>
                  <Textarea id="shipping-policy" placeholder="e.g., We ship within 3-5 business days. Delivery fees vary by location." value={shippingPolicy} onChange={(e) => setShippingPolicy(e.target.value)} />
                </div>
                 <div className="grid gap-3">
                  <Label htmlFor="return-policy">Return Policy</Label>
                  <Textarea id="return-policy" placeholder="e.g., Returns accepted within 7 days for defective products only. Buyer is responsible for return shipping." value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} />
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
                    <PhotoUpload
                      label="Certificate of Incorporation"
                      onUpload={setCertUrl}
                      initialUrl={certUrl}
                    />
                    <PhotoUpload
                      label="KRA PIN Certificate"
                      onUpload={setKraPinUrl}
                      initialUrl={kraPinUrl}
                    />
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
                            <Input id="website" className="pl-8" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid gap-3">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                         <div className="relative">
                            <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="linkedin" className="pl-8" placeholder="linkedin.com/company/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
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
                        <Switch id="tradpay-switch" checked={acceptsTradPay} onCheckedChange={setAcceptsTradPay} />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="tradpoints-switch" className="flex flex-col gap-1">
                            <span>Issue TradPoints</span>
                            <span className="font-normal text-xs text-muted-foreground">Reward buyers for purchases.</span>
                        </Label>
                        <Switch id="tradpoints-switch" checked={issuesTradPoints} onCheckedChange={setIssuesTradPoints} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <div className="flex items-center justify-end gap-2 md:hidden mt-6">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveChanges} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
    </div>
  );
}

    