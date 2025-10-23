import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function MarketingDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Marketing Dashboard</CardTitle>
                <CardDescription>Leads promotions, ambassador activities, and ad placements.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Marketing specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
