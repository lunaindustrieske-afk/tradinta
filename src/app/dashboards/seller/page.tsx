import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SellerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manufacturer / Seller Dashboard</CardTitle>
                <CardDescription>Manage your products, respond to quotes, and view your shop analytics.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Seller specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
