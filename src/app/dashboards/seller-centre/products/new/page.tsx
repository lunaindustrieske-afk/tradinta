
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Sparkles,
  Loader2,
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
import { PhotoUpload } from '@/components/photo-upload';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { generateSlug } from '@/lib/utils';


export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const initialState: AIFormState = { message: '', output: null, errors: null };
  const [state, dispatch] = React.useActionState(
    getAITagsAndDescription,
    initialState
  );
  
  const [formKey, setFormKey] = React.useState(Date.now());
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [moq, setMoq] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [subcategories, setSubcategories] = React.useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>('');

  // New fields
  const [weight, setWeight] = React.useState('');
  const [dimensions, setDimensions] = React.useState('');
  const [material, setMaterial] = React.useState('');
  const [certifications, setCertifications] = React.useState('');
  const [packagingDetails, setPackagingDetails] = React.useState('');

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

  const handleSaveProduct = async (status: 'draft' | 'published') => {
    if (!user || !firestore) {
        toast({ title: 'Error', description: 'User not authenticated or Firestore not available.', variant: 'destructive' });
        return;
    }

    setIsSaving(true);
    try {
        const productsCollectionRef = collection(firestore, 'manufacturers', user.uid, 'products');
        
        await addDoc(productsCollectionRef, {
            manufacturerId: user.uid,
            name,
            slug: generateSlug(name),
            description,
            price: Number(price) || 0,
            moq: Number(moq) || 0,
            sku,
            stock: Number(stock) || 0,
            category: selectedCategory?.name || '',
            subcategory: selectedSubCategory || '',
            imageUrl,
            tags,
            status,
            weight,
            dimensions,
            material,
            certifications,
            packagingDetails,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast({
            title: 'Product Saved!',
            description: `Your product has been saved as a ${status}.`,
        });
        router.push('/dashboards/seller-centre/products');

    } catch (error) {
        console.error("Error saving product:", error);
        toast({
            title: 'Save Failed',
            description: 'There was an error saving your product. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
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
          Add New Product
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => handleSaveProduct('draft')} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save as Draft
          </Button>
          <Button size="sm" onClick={() => handleSaveProduct('published')} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Review
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
          <Card>
            <CardHeader>
              <CardTitle>Product Media</CardTitle>
              <CardDescription>
                Upload high-quality images to showcase your product.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <PhotoUpload
                    label="Main Product Image"
                    onUpload={setImageUrl}
                    initialUrl={imageUrl}
                />
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="price">Base Price (KES)</Label>
                  <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                 <div className="grid gap-3">
                  <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                  <Input id="moq" type="number" placeholder="1" value={moq} onChange={(e) => setMoq(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                 <div className="grid gap-3">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input id="sku" type="text" placeholder="SKU-123" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <Select onValueChange={handleCategoryChange}>
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
        <Button variant="outline" size="sm" onClick={() => handleSaveProduct('draft')} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save as Draft
        </Button>
        <Button size="sm" onClick={() => handleSaveProduct('published')} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Review
        </Button>
      </div>
    </div>
  );
}
