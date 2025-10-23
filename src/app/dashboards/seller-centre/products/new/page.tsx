'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  PlusCircle,
  Upload,
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
import { useFormState } from 'react-dom';
import { getAITagsAndDescription, type AIFormState } from '@/app/lib/actions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function NewProductPage() {
  const { toast } = useToast();
  const initialState: AIFormState = { message: '', output: null, errors: null };
  const [state, dispatch] = useFormState(
    getAITagsAndDescription,
    initialState
  );

  const [formKey, setFormKey] = React.useState(Date.now());
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    if (state.message) {
      setIsGenerating(false);
      if (state.output) {
        toast({
          title: 'AI Magic Complete!',
          description: 'Tags and description have been generated.',
        });
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
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm">Save Product</Button>
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
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your product, including features, benefits, and applications."
                    className="min-h-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload high-quality images to showcase your product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label
                    htmlFor="picture"
                    className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="sr-only">Upload</span>
                  </Label>
                  <Input id="picture" type="file" className="sr-only" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Smart-Tagging</CardTitle>
              <CardDescription>
                Use AI to automatically generate tags and a description for
                better discoverability.
              </CardDescription>
            </CardHeader>
            <form action={handleGenerate} key={formKey}>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      name="productName"
                      type="text"
                      className="w-full"
                      defaultValue={state.productName || ''}
                      placeholder="e.g. Industrial Grade Cement"
                    />
                     {state.errors?.productName && (
                      <p className="text-sm text-destructive">{state.errors.productName[0]}</p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="productDetails">Product Details</Label>
                    <Textarea
                      id="productDetails"
                      name="productDetails"
                      defaultValue={state.productDetails || ''}
                      placeholder="Provide key details for the AI. e.g., '50kg bag of high-strength Portland cement for construction projects. KEBS certified.'"
                    />
                    {state.errors?.productDetails && (
                      <p className="text-sm text-destructive">{state.errors.productDetails[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t px-6 py-4">
                <Button type="button" variant="ghost" onClick={resetForm}>Reset</Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate with AI
                </Button>
              </CardFooter>
            </form>
             {state.output && (
              <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label>Generated Tags</Label>
                         <div className="flex flex-wrap gap-2">
                            {state.output.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label>Generated Description</Label>
                        <Textarea
                            readOnly
                            value={state.output.description}
                            className="bg-muted"
                        />
                    </div>
                  </div>
              </CardContent>
            )}
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
                  <Input id="price" type="number" placeholder="0.00" />
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
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="category">Business Category</Label>
                  <Select>
                    <SelectTrigger id="category" aria-label="Select category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm">
          Discard
        </Button>
        <Button size="sm">Save Product</Button>
      </div>
    </div>
  );
}
