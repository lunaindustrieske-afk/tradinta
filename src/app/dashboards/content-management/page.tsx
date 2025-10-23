import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Newspaper, FileVideo } from "lucide-react";

const homepageBanners = [
    { id: 'BANNER01', title: 'End of Year Clearance', status: 'Live', startDate: '2023-11-01', endDate: '2023-12-31' },
    { id: 'BANNER02', title: 'New Seller Spotlight: PlastiCo', status: 'Draft', startDate: '2023-11-20', endDate: '2023-12-05' },
];

const blogPosts = [
    { id: 'POST01', title: 'The Future of B2B Logistics in Africa', status: 'Published', author: 'Jane Doe', lastUpdated: '2023-10-20' },
    { id: 'POST02', title: 'How to Digitize Your Factory Sales', status: 'Draft', author: 'John Admin', lastUpdated: '2023-11-10' },
];


export default function ContentManagementDashboard() {
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
                            <Button><LayoutTemplate className="mr-2 h-4 w-4" /> Add New Banner</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active Dates</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {homepageBanners.map((banner) => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-medium">{banner.title}</TableCell>
                                        <TableCell>{banner.status}</TableCell>
                                        <TableCell>{banner.startDate} to {banner.endDate}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                            <Button><Newspaper className="mr-2 h-4 w-4" /> Create New Post</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>{post.status}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.lastUpdated}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button size="sm">{post.status === 'Draft' ? 'Publish' : 'Unpublish'}</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="static-pages">
                 <Card>
                    <CardHeader>
                        <CardTitle>Static Pages</CardTitle>
                        <CardDescription>Edit content on pages like "About Us", "Privacy Policy", and "Terms of Service".</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <FileVideo className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Static Page Editor Component Here</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
