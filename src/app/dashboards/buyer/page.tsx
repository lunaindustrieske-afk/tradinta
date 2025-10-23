import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BuyerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Retail Buyer / Business Client Dashboard</CardTitle>
                <CardDescription>Request quotations, make payments, and rate sellers.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Buyer specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
