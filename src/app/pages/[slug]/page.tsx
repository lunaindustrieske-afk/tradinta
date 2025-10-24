'use client';

import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

// You might want to use a library like 'react-markdown' to render markdown content safely
// For this example, we'll use a simple div with dangerouslySetInnerHTML, but be cautious with this in production.
// import ReactMarkdown from 'react-markdown'; 

type SitePage = {
    title: string;
    content: string;
    lastUpdated: any;
};

export default function StaticPage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    
    const [page, setPage] = React.useState<SitePage | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPage = async () => {
            if (!firestore || !slug) return;
            setIsLoading(true);

            const pageQuery = query(collection(firestore, 'sitePages'), where('slug', '==', slug), limit(1));
            const querySnapshot = await getDocs(pageQuery);

            if (querySnapshot.empty) {
                setPage(null);
            } else {
                setPage(querySnapshot.docs[0].data() as SitePage);
            }
            setIsLoading(false);
        }

        fetchPage();
    }, [firestore, slug]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-12">
                <Skeleton className="h-8 w-64 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!page) {
        return notFound();
    }
    
    // In a real app, you would use a markdown renderer here for safety and functionality
    // e.g. <ReactMarkdown>{page.content}</ReactMarkdown>
    // For now, using dangerouslySetInnerHTML. Be aware of XSS risks if content is not controlled.
    const createMarkup = () => {
        // A simple markdown to HTML converter for basic formatting
        let html = page.content;
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        html = html.replace(/\n/gim, '<br />');
        return { __html: html };
    };

    return (
        <div className="container mx-auto py-12">
             <Breadcrumb className="mb-6">
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{page.title}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">{page.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={createMarkup()} />
                </CardContent>
            </Card>
        </div>
    );
}
