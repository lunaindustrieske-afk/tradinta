'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { generateSlug } from '@/lib/utils';

type BlogPost = {
    title: string;
    slug: string;
    author: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
};

export default function EditBlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;
    const firestore = useFirestore();
    const { toast } = useToast();

    const postDocRef = useMemoFirebase(() => firestore && postId ? doc(firestore, 'blogPosts', postId) : null, [firestore, postId]);
    const { data: post, isLoading: isPostLoading } = useDoc<BlogPost>(postDocRef);

    const [title, setTitle] = React.useState('');
    const [author, setAuthor] = React.useState('');
    const [content, setContent] = React.useState('');
    const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>('draft');

    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        if (post) {
            setTitle(post.title || '');
            setAuthor(post.author || '');
            setContent(post.content || '');
            setStatus(post.status || 'draft');
        }
    }, [post]);

    const handleSave = async () => {
        if (!postDocRef) return;
        setIsSaving(true);
        try {
            await updateDoc(postDocRef, {
                title,
                slug: generateSlug(title),
                author,
                content,
                status,
                publishedAt: status === 'published' && !post?.publishedAt ? serverTimestamp() : post?.publishedAt
            });
            toast({ title: 'Success', description: 'Blog post updated.' });
            router.push('/dashboards/content-management');
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to update post.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!postDocRef) return;
        setIsDeleting(true);
        try {
            await deleteDoc(postDocRef);
            toast({ title: 'Success', description: 'Blog post deleted.' });
            router.push('/dashboards/content-management');
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to delete post.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isPostLoading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/dashboards/content-management"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Edit Blog Post</h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the blog post.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Post
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader><CardTitle>Post Content</CardTitle><CardDescription>Edit the details of the blog post.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="grid gap-3 md:col-span-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid gap-3">
                        <Label htmlFor="content">Content (Markdown supported)</Label>
                        <Textarea id="content" className="min-h-80" value={content} onChange={(e) => setContent(e.target.value)} />
                    </div>
                    <div className="grid gap-3 max-w-xs">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(v: 'draft' | 'published' | 'archived') => setStatus(v)}>
                            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
