'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { getAITagsAndDescription, type AIFormState } from '@/app/lib/actions';
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
import { Badge } from '@/components/ui/badge';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Metadata
        </>
      )}
    </Button>
  );
}

export default function AIToolsPage() {
  const initialState: AIFormState = {
    message: '',
    errors: null,
    output: null,
  };
  const [state, formAction] = useFormState(getAITagsAndDescription, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Smart Product Tagging</CardTitle>
              <CardDescription>
                Enter your product details below and let our AI generate
                relevant tags and a compelling description for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="e.g., Industrial Grade Cement"
                  defaultValue={state.productName}
                />
                 {state.errors?.productName &&
                  state.errors.productName.map((error: string) => (
                    <p className="text-sm font-medium text-destructive" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productDetails">Product Details</Label>
                <Textarea
                  id="productDetails"
                  name="productDetails"
                  placeholder="Describe your product's features, materials, and use cases."
                  className="min-h-32"
                  defaultValue={state.productDetails}
                />
                 {state.errors?.productDetails &&
                  state.errors.productDetails.map((error: string) => (
                    <p className="text-sm font-medium text-destructive" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              {state.message && !state.errors && !state.output && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI Generated Output</CardTitle>
            <CardDescription>
              The generated tags and description will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.output ? (
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generated Description</h3>
                  <p className="text-sm text-muted-foreground">{state.output.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generated Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.output.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                  <Bot className="mx-auto h-12 w-12" />
                  <p>Waiting for product details...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
