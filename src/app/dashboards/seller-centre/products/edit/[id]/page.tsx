
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Sparkles,
  Loader2,
  Save,
  Trash2,
  PlusCircle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getAITagsAndDescription, type AIFormState } from '@/app/lib/actions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { categories, Category } from '@/app/lib/categories';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSlug } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { nanoid } from 'nanoid';

type Variant = {
    id: string;
    price: string;
    stock: string;
    sku: string;
    attributes: Record<string, string>;
};

type ProductData = {
    name: string;
    description: string;
    imageUrl: string;
    bannerUrl?: string; // New field for the main banner
    otherImageUrls?: string[]; // New field for additional images
    tags: string[];
    category: string;
    subcategory: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    weight?: string;
    dimensions?: string;
    material?: string;
    certifications?: string;
    packagingDetails?: string;
    // Variant-related fields
    options?: string[];
    variants?: Variant[];
};

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const productId = params.id as string;

  const productDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore || !productId) return null;
    return doc(firestore, 'manufacturers', user.uid, 'products', productId);
  }, [firestore, user, productId]);

  const { data: productData, isLoading: isProductLoading } = useDoc<ProductData>(productDocRef);

  const initialState: AIFormState = { message: '', output: null, errors: null };
  const [state, dispatch] = React.useActionState(
    getAITagsAndDescription,
    initialState
  );
  
  const [formKey, setFormKey] = React.useState(Date.now());
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [bannerUrl, setBannerUrl] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [subcategories, setSubcategories] = React.useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>('');

  // Variant State
  const [options, setOptions] = React.useState<string[]>(['']);
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // New fields
  const [weight, setWeight] = React.useState('');
  const [dimensions, setDimensions] = React.useState('');
  const [material, setMaterial] = React.useState('');
  const [certifications, setCertifications] = React.useState('');
  const [packagingDetails, setPackagingDetails] = React.useState('');
  
  React.useEffect(() => {
    if (productData) {
        setName(productData.name || '');
        setDescription(productData.description || '');
        setImageUrl(productData.imageUrl || '');
        setBannerUrl(productData.bannerUrl || '');
        setTags(productData.tags || []);
        
        setWeight(productData.weight || '');
        setDimensions(productData.dimensions || '');
        setMaterial(productData.material || '');
        setCertifications(productData.certifications || '');
        setPackagingDetails(productData.packagingDetails || '');

        setOptions(productData.options && productData.options.length > 0 ? productData.options : ['']);
        setVariants(productData.variants || []);

        if (productData.category) {
            const category = categories.find(c => c.name === productData.category);
            if (category) {
                setSelectedCategory(category);
                setSubcategories(category.subcategories);
                setSelectedSubCategory(productData.subcategory || '');
            }
        }
    }
  }, [productData]);

  const handleAddOption = () => setOptions([...options, '']);
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };
  
  const handleAddVariant = () => {
    const newVariant: Variant = {
        id: nanoid(),
        price: '',
        stock: '',
        sku: '',
        attributes: options.reduce((acc, option) => {
            if (option) acc[option] = '';
            return acc;
        }, {} as Record<string, string>),
    };
    setVariants([...variants, newVariant]);
  };
  const handleVariantChange = (variantId: string, field: keyof Omit<Variant, 'id'|'attributes'>, value: string) => {
    setVariants(variants.map(v => v.id === variantId ? { ...v, [field]: value } : v));
  };
  const handleAttributeChange = (variantId: string, attribute: string, value: string) => {
    setVariants(variants.map(v => v.id === variantId ? { ...v, attributes: { ...v.attributes, [attribute]: value } } : v));
  };
   const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };


  const handleCategoryChange = (value: string) => {
    const category = categories.find((c) => c.name === value);
    if (category) {
      setSelectedCategory(category);
      setSubcategories(category.subcategories);
      setSelectedSubCategory('');
    } else {
      setSelectedCategory(null);
      setSubcategories([]);
      setSelectedSubCategory('');
    }
  };

  React.useEffect(() => {
    if (state.message) {
      setIsGenerating(false);
      if (state.output) {
        toast({
          title: 'AI Magic Complete!',
          description: 'Tags and description have been generated.',
        });
        setTags(state.output.tags);
        setDescription(state.output.description);
      } else if (state.errors) {
        toast({
          title: 'Validation Error',
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Uh oh!',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  const handleGenerate = (formData: FormData) => {
    setIsGenerating(true);
    dispatch(formData);
  };
  
  const resetForm = () => {
    setFormKey(Date.now());
  };

  const handleUpdateProduct = async (status: 'draft' | 'published') => {
    if (!productDocRef) {
        toast({ title: 'Error', description: 'Product reference is not available.', variant: 'destructive' });
        return;
    }

    setIsSaving(true);
    try {
        await updateDoc(productDocRef, {
            name,
            slug: generateSlug(name),
            description,
            category: selectedCategory?.name || '',
            subcategory: selectedSubCategory || '',
            imageUrl, // This is now a secondary/thumbnail image
            bannerUrl, // This is the main banner image
            tags,
            options: options.filter(Boolean),
            variants: variants.map(v => ({
                ...v,
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0,
            })),
            weight,
            dimensions,
            material,
            certifications,
            packagingDetails,
            status, // update status
            updatedAt: serverTimestamp(),
        });

        toast({
            title: 'Product Updated!',
            description: `Your product has been successfully updated.`,
        });
        router.push('/dashboards/seller-centre/products');

    } catch (error) {
        console.error("Error updating product:", error);
        toast({
            title: 'Update Failed',
            description: 'There was an error updating your product. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  }

  const isSaveDisabled = isSaving || isUploading;

  if (isProductLoading) {
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-48" />
             </div>
              <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                     <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                     <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                 </div>
            </div>
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboards/seller-centre/products">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Edit Product
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => handleUpdateProduct('draft')} disabled={isSaveDisabled}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save as Draft
          </Button>
          <Button size="sm" onClick={() => handleUpdateProduct('published')} disabled={isSaveDisabled}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save and Publish
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Provide the essential information about your product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full"
                    placeholder="e.g. Industrial Grade Cement"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your product, including features, benefits, and applications."
                    className="min-h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                {tags.length > 0 && (
                    <div className="grid gap-3">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                            {tag}
                            </Badge>
                        ))}
                        </div>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ai-tagging">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>AI Smart-Tagging & Description</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <form action={handleGenerate} key={formKey} className="p-4">
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="productName">Product Name</Label>
                          <Input
                            id="productName"
                            name="productName"
                            type="text"
                            className="w-full"
                            defaultValue={name}
                            placeholder="e.g. Industrial Grade Cement"
                          />
                          {state.errors?.productName && (
                            <p className="text-sm text-destructive">
                              {state.errors.productName[0]}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="productDetails">
                            Product Details
                          </Label>
                          <Textarea
                            id="productDetails"
                            name="productDetails"
                            defaultValue={description}
                            placeholder="Provide key details for the AI. e.g., '50kg bag of high-strength Portland cement for construction projects. KEBS certified.'"
                          />
                          {state.errors?.productDetails && (
                            <p className="text-sm text-destructive">
                              {state.errors.productDetails[0]}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={resetForm}>Reset</Button>
                            <Button type="submit" disabled={isGenerating}>
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Generate with AI
                            </Button>
                        </div>
                      </div>
                    </form>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardFooter>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Add options like size or color to create different versions of this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label>Variant Options</Label>
                    <div className="space-y-2 mt-2">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    placeholder={`Option ${index + 1} (e.g., Size)`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                {options.length > 1 && <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>}
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAddOption}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add another option
                    </Button>
                </div>
                
                {options.filter(Boolean).length > 0 && (
                    <div>
                         <Label>Variants List</Label>
                         <div className="space-y-4 mt-2">
                            {variants.map(variant => (
                                <Card key={variant.id} className="p-4 bg-muted/50">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {Object.keys(variant.attributes).map(attr => (
                                            <div key={attr} className="grid gap-2">
                                                <Label className="text-xs">{attr}</Label>
                                                <Input placeholder={attr} value={variant.attributes[attr]} onChange={e => handleAttributeChange(variant.id, attr, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4 mt-4">
                                        <div className="grid gap-2"><Label className="text-xs">Price (KES)</Label><Input type="number" placeholder="0.00" value={variant.price} onChange={e => handleVariantChange(variant.id, 'price', e.target.value)} /></div>
                                        <div className="grid gap-2"><Label className="text-xs">Stock</Label><Input type="number" placeholder="0" value={variant.stock} onChange={e => handleVariantChange(variant.id, 'stock', e.target.value)} /></div>
                                        <div className="grid gap-2"><Label className="text-xs">SKU</Label><Input placeholder="SKU-VAR-01" value={variant.sku} onChange={e => handleVariantChange(variant.id, 'sku', e.target.value)} /></div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={() => handleRemoveVariant(variant.id)}>Remove Variant</Button>
                                </Card>
                            ))}
                         </div>
                         <Button variant="secondary" className="mt-4" onClick={handleAddVariant}>
                             <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                         </Button>
                    </div>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Media</CardTitle>
              <CardDescription>
                Upload a main banner and additional images to showcase your product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <PhotoUpload
                    label="Main Banner Image"
                    onUpload={setBannerUrl}
                    onLoadingChange={setIsUploading}
                    initialUrl={bannerUrl}
                />
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <PhotoUpload
                        label="Additional Image 1"
                        onUpload={setImageUrl}
                        onLoadingChange={setIsUploading}
                        initialUrl={imageUrl}
                    />
                    {/* Add more PhotoUpload components here for more images */}
                     <PhotoUpload
                        label="Additional Image 2"
                        onUpload={(url) => {}} // Placeholder
                        onLoadingChange={setIsUploading}
                    />
                     <PhotoUpload
                        label="Additional Image 3"
                        onUpload={(url) => {}} // Placeholder
                        onLoadingChange={setIsUploading}
                    />
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Specifications & Packaging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" placeholder="e.g., 50kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input id="dimensions" placeholder="e.g., 80cm x 50cm x 15cm" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" placeholder="e.g., Portland Cement Type I" value={material} onChange={(e) => setMaterial(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="certifications">Standards</Label>
                  <Input id="certifications" placeholder="e.g., KEBS Certified, ISO 9001" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:col-span-2">
                  <Label htmlFor="packagingDetails">Packaging Details</Label>
                  <Textarea id="packagingDetails" placeholder="Describe the product packaging..." className="min-h-24" value={packagingDetails} onChange={(e) => setPackagingDetails(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>
                Select a category and sub-category for your product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={handleCategoryChange} value={selectedCategory?.name}>
                    <SelectTrigger id="category" aria-label="Select category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="subcategory">Sub-category</Label>
                  <Select
                    value={selectedSubCategory}
                    onValueChange={setSelectedSubCategory}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger
                      id="subcategory"
                      aria-label="Select sub-category"
                    >
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
         <Button variant="outline" size="sm" onClick={() => handleUpdateProduct('draft')} disabled={isSaveDisabled}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save as Draft
          </Button>
          <Button size="sm" onClick={() => handleUpdateProduct('published')} disabled={isSaveDisabled}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save and Publish
          </Button>
      </div>
    </div>
  );
}
