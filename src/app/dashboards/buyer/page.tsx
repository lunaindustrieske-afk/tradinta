import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BuyerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Buyer Dashboard</CardTitle>
                <CardDescription>This is a simplified view for buyers. All your orders, quotations, and messages are now managed from the main dashboard page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Welcome to your streamlined buyer dashboard.</p>
            </CardContent>
        </Card>
    );
}
