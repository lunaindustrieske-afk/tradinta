
'use client';

import { useFirestore, useUser } from '@/firebase';
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
    const { isUserLoading: isAuthLoading } = useUser();
    
    const [post, setPost] = React.useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPost = async () => {
            // Wait for both Firestore and authentication to be ready before fetching.
            if (!firestore || !slug || isAuthLoading) return;
            
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
    }, [firestore, slug, isAuthLoading]);

    if (isLoading || isAuthLoading) {
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
    const createMarkup = (markdown?: string) => {
        if (!markdown) return { __html: '' };

        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
            .replace(/\n$/gim, '<br />')
            .replace(/\n/g, '<br />');

        // Handle unordered lists
        html = html.replace(/(\<br \/\>)?\s?\*\s(.*?)(?=\<br \/\>|$)/g, '<li>$2</li>');
        html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
        
        // Handle ordered lists
        html = html.replace(/(\<br \/\>)?\s?\d\.\s(.*?)(?=\<br \/\>|$)/g, '<li>$2</li>');
        html = html.replace(/<li>(.*?)<\/li>/g, (match, content) => {
            if (content.match(/^\d\./)) return match;
            return `<li>${content}</li>`;
        });
        html = html.replace(/(<li>.*<\/li>)+/g, (match) => {
            if(match.includes('<ul>')) return match;
            if(match.match(/<li>\d\./)) return match; // Bit of a hack to avoid re-wrapping
            return `<ol>${match}</ol>`;
        });

        // Cleanup empty paragraphs
        html = html.replace(/<p><\/p>/g, '');

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
                <div className="prose" dangerouslySetInnerHTML={createMarkup(post.content)} />
            </article>
        </div>
    );
}
