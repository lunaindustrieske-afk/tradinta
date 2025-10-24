
'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Newspaper, FileText, PlusCircle, MoreHorizontal, File, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HomepageBanner = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  imageUrl: string;
};

type BlogPost = {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  publishedAt: any;
};

type SitePage = {
    id: string;
    title: string;
    slug: string;
    lastUpdated: any;
};

export default function ContentManagementDashboard() {
    const firestore = useFirestore();

    const bannersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'homepageBanners')) : null, [firestore]);
    const postsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'blogPosts')) : null, [firestore]);
    const pagesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'sitePages')) : null, [firestore]);

    const { data: homepageBanners, isLoading: isLoadingBanners } = useCollection<HomepageBanner>(bannersQuery);
    const { data: blogPosts, isLoading: isLoadingPosts } = useCollection<BlogPost>(postsQuery);
    const { data: sitePages, isLoading: isLoadingPages } = useCollection<SitePage>(pagesQuery);

    const renderSkeletonRows = (count: number, columns: number) => Array.from({ length: count }).map((_, i) => (
        <TableRow key={`skel-row-${i}`}>
            {Array.from({ length: columns }).map((_, j) => (
                <TableCell key={`skel-cell-${j}`}><Skeleton className="h-5 w-full" /></TableCell>
            ))}
        </TableRow>
    ));

    return (
        <Tabs defaultValue="banners">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="banners">Homepage Banners</TabsTrigger>
                <TabsTrigger value="blog">Blog & Insights</TabsTrigger>
                <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
            </TabsList>

            <TabsContent value="banners">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Homepage Banners</CardTitle>
                                <CardDescription>Manage promotional and informational banners on the homepage.</CardDescription>
                            </div>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Banner</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingBanners ? renderSkeletonRows(2, 3) 
                                : homepageBanners && homepageBanners.length > 0 ? homepageBanners.map((banner) => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-medium">{banner.title}</TableCell>
                                        <TableCell><Badge variant={banner.status === 'published' ? 'secondary' : 'outline'}>{banner.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                                : <TableRow><TableCell colSpan={3} className="text-center h-24">No banners created yet.</TableCell></TableRow>
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="blog">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Blog Posts & Insights</CardTitle>
                                <CardDescription>Create and manage articles for the Tradinta Insights section.</CardDescription>
                            </div>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Post</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {isLoadingPosts ? renderSkeletonRows(3, 5)
                                : blogPosts && blogPosts.length > 0 ? blogPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell><Badge variant={post.status === 'published' ? 'secondary' : 'outline'}>{post.status}</Badge></TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.publishedAt ? new Date(post.publishedAt?.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                                : <TableRow><TableCell colSpan={5} className="text-center h-24">No blog posts created yet.</TableCell></TableRow>
                               }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="static-pages">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Static Pages</CardTitle>
                                <CardDescription>Edit content on pages like "About Us", "Privacy Policy", etc.</CardDescription>
                            </div>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Page</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page Title</TableHead>
                                    <TableHead>URL Slug</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {isLoadingPages ? renderSkeletonRows(2, 4)
                                : sitePages && sitePages.length > 0 ? sitePages.map((page) => (
                                    <TableRow key={page.id}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell className="font-mono text-xs">/{page.slug}</TableCell>
                                        <TableCell>{page.lastUpdated ? new Date(page.lastUpdated?.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                                : <TableRow><TableCell colSpan={4} className="text-center h-24">No static pages created yet.</TableCell></TableRow>
                               }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

    