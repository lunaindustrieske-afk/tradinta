'use client';

import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type BlogPost = {
    title: string;
    content: string;
    author: string;
    publishedAt: any;
};

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    
    const [post, setPost] = React.useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPost = async () => {
            if (!firestore || !slug) return;
            setIsLoading(true);

            const postQuery = query(collection(firestore, 'blogPosts'), where('slug', '==', slug), limit(1));
            const querySnapshot = await getDocs(postQuery);

            if (querySnapshot.empty) {
                setPost(null);
            } else {
                setPost(querySnapshot.docs[0].data() as BlogPost);
            }
            setIsLoading(false);
        }

        fetchPost();
    }, [firestore, slug]);

    if (isLoading) {
        return (
            <div className="container max-w-3xl mx-auto py-12">
                <Skeleton className="h-8 w-64 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!post) {
        return notFound();
    }

    // A simple markdown to HTML converter for basic formatting
    const createMarkup = () => {
        let html = post.content;
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold font-headline mt-8 mb-4">$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold font-headline mt-6 mb-3">$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        html = html.replace(/\n/gim, '<br />');
        return { __html: html };
    };

    return (
        <div className="container max-w-3xl mx-auto py-12">
             <Breadcrumb className="mb-6">
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                 <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/blog">Insights</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{post.title}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <article>
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-headline mb-3">{post.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://picsum.photos/seed/${post.author}/32/32`} />
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.author}</span>
                        </div>
                        <time dateTime={post.publishedAt?.toDate().toISOString()}>
                           {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        </time>
                    </div>
                </header>
                <div className="prose max-w-none" dangerouslySetInnerHTML={createMarkup()} />
            </article>
        </div>
    );
}
