'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Globe,
  Link as LinkIcon,
  Loader2,
  Eye,
  UploadCloud,
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
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { PhotoUpload } from '@/components/ui/photo-upload';

type ManufacturerData = {
  shopId?: string;
  shopName?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoHistory?: string[];
  businessLicenseNumber?: string;
  kraPin?: string;
  address?: string;
  phone?: string;
  paymentPolicy?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  website?: string;
  linkedin?: string;
  acceptsTradPay?: boolean;
  issuesTradPoints?: boolean;
  certifications?: string[];
  verificationStatus?: 'Unsubmitted' | 'Pending Legal' | 'Pending Admin' | 'Action Required' | 'Verified';
};

const LogoManager = ({
    initialLogoUrl,
    initialHistory = [],
    onLogoChange,
    onHistoryChange
}: {
    initialLogoUrl?: string;
    initialHistory?: string[];
    onLogoChange: (url: string) => void;
    onHistoryChange: (url: string) => void;
}) => {
    const [activeLogo, setActiveLogo] = useState(initialLogoUrl);
    const [logoHistory, setLogoHistory] = useState(initialHistory);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setActiveLogo(initialLogoUrl);
    }, [initialLogoUrl]);
    
    useEffect(() => {
        setLogoHistory(initialHistory);
    }, [initialHistory]);

    const handleNewUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const paramsToSign = { timestamp: Math.round(new Date().getTime() / 1000) };
            const signatureResponse = await fetch('/api/sign-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paramsToSign }),
            });
            const { signature } = await signatureResponse.json();
            if (!signature) throw new Error('Failed to get upload signature.');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
            formData.append('signature', signature);
            formData.append('timestamp', paramsToSign.timestamp.toString());

            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.error?.message || 'Upload failed.');
            
            const newUrl = data.secure_url;
            onHistoryChange(newUrl); // Propagate new URL to parent to be added to history
            onLogoChange(newUrl); // Set new URL as active
            setActiveLogo(newUrl);
            setLogoHistory(prev => [newUrl, ...prev]);

            toast({ title: 'Upload Successful' });
        } catch (error: any) {
            toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsUploading(false);
        }
    };
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                handleNewUpload(acceptedFiles[0]);
            }
        },
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] },
        multiple: false,
    });
    
    const handleSelectLogo = (url: string) => {
        setActiveLogo(url);
        onLogoChange(url);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Active Logo</Label>
                <div className="mt-1 w-32 h-32 relative rounded-md border flex items-center justify-center bg-muted/50 overflow-hidden">
                    {activeLogo ? <Image src={activeLogo} alt="Active Logo" fill className="object-contain p-2" /> : <span className="text-xs text-muted-foreground">No logo</span>}
                </div>
            </div>
            <div>
                <Label>Logo History</Label>
                <p className="text-xs text-muted-foreground">Click a logo to make it active.</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                    {logoHistory.map((url, index) => (
                        <div key={index} className={cn("relative w-full aspect-square rounded-md border-2 cursor-pointer overflow-hidden", activeLogo === url ? 'border-primary' : 'border-transparent')} onClick={() => handleSelectLogo(url)}>
                            <Image src={url} alt={`Previous logo ${index + 1}`} fill className="object-cover" />
                        </div>
                    ))}
                    <div {...getRootProps()} className={cn("flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed text-center text-muted-foreground", isDragActive ? 'border-primary' : 'hover:border-primary/50')}>
                        <input {...getInputProps()} />
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function EditShopProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Form state
  const [shopId, setShopId] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopTagline, setShopTagline] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoHistory, setLogoHistory] = useState<string[]>([]);
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
  const [issuesTradPoints, setIssuesTradPoints] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<ManufacturerData['verificationStatus']>('Unsubmitted');


  // Fetch existing data
  useEffect(() => {
    if (user && firestore) {
      const fetchManufacturerData = async () => {
        const manufRef = doc(firestore, 'manufacturers', user.uid);
        const docSnap = await getDoc(manufRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ManufacturerData;
          setShopId(data.shopId || '');
          setShopName(data.shopName || '');
          setShopTagline(data.tagline || '');
          setShopDescription(data.description || '');
          setLogoUrl(data.logoUrl || '');
          setLogoHistory(data.logoHistory || []);
          setBizRegNo(data.businessLicenseNumber || '');
          setKraPin(data.kraPin || '');
          setBizAddress(data.address || '');
          setBizPhone(data.phone || '');
          setPaymentPolicy(data.paymentPolicy || '');
          setShippingPolicy(data.shippingPolicy || '');
          setReturnPolicy(data.returnPolicy || '');
          setWebsite(data.website || '');
          setLinkedin(data.linkedin || '');
          setIssuesTradPoints(data.issuesTradPoints === true);
          setVerificationStatus(data.verificationStatus || 'Unsubmitted');
          
          if(data.certifications && data.certifications.length > 0) {
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

    // Generate a new shopId only if one doesn't exist
    const finalShopId = shopId || nanoid(6);

    const manufacturerData: Omit<ManufacturerData, 'logoHistory'> & { logoHistory?: any } = {
      shopId: finalShopId,
      shopName,
      tagline: shopTagline,
      description: shopDescription,
      logoUrl,
      businessLicenseNumber: bizRegNo,
      kraPin,
      address: bizAddress,
      phone: bizPhone,
      paymentPolicy,
      shippingPolicy,
      returnPolicy,
      website,
      linkedin,
      acceptsTradPay: false, // Permanently disabled
      issuesTradPoints,
      certifications: [certUrl, kraPinUrl].filter(Boolean),
      // Update status only if it's the first time submitting
      verificationStatus: verificationStatus === 'Unsubmitted' && (bizRegNo || certUrl || kraPinUrl) ? 'Pending Legal' : verificationStatus,
    };
    
    // We handle logoHistory separately to use arrayUnion
    const newLogoForHistory = logoHistory.includes(logoUrl) ? null : logoUrl;
    if (newLogoForHistory) {
        manufacturerData.logoHistory = arrayUnion(newLogoForHistory);
    }
    
    try {
      const manufRef = doc(firestore, 'manufacturers', user.uid);
      await setDoc(manufRef, manufacturerData, { merge: true });
      
      toast({
        title: "Profile Saved!",
        description: "Your changes have been successfully saved.",
      });

      // Optimistically update local state if needed
      if (manufacturerData.verificationStatus) {
        setVerificationStatus(manufacturerData.verificationStatus);
      }
      setShopId(finalShopId);


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
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const isVerified = verificationStatus === 'Verified';

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
          <Button variant="outline" size="sm" asChild disabled={!shopId}>
              <Link href={`/manufacturer/${shopId}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  View Public Shop
              </Link>
          </Button>
          <Button size="sm" onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
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
                Manage your shop's identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <CardHeader><CardTitle>Shop Logo</CardTitle></CardHeader>
                <CardContent>
                     <LogoManager 
                        initialLogoUrl={logoUrl} 
                        initialHistory={logoHistory}
                        onLogoChange={setLogoUrl}
                        onHistoryChange={(newUrl) => {
                            if (!logoHistory.includes(newUrl)) {
                                setLogoHistory(prev => [newUrl, ...prev]);
                            }
                        }}
                    />
                </CardContent>
            </Card>

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
                        <Label htmlFor="tradpay-switch" className="flex flex-col gap-1 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-70" data-disabled="true">
                            <span>Accept TradPay</span>
                            <span className="font-normal text-xs text-muted-foreground">TradPay is currently disabled platform-wide.</span>
                        </Label>
                        <Switch id="tradpay-switch" disabled={true} checked={false} />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="tradpoints-switch" className="flex flex-col gap-1 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-70" data-disabled={!isVerified}>
                            <span>Issue TradPoints</span>
                            <span className="font-normal text-xs text-muted-foreground">Reward buyers for purchases. Requires verification.</span>
                        </Label>
                        <Switch id="tradpoints-switch" checked={issuesTradPoints} onCheckedChange={setIssuesTradPoints} disabled={!isVerified} />
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
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
    </div>
  );
}
