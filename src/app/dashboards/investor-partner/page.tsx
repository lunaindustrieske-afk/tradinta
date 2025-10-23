import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function InvestorPartnerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Investor / Partner Dashboard</CardTitle>
                <CardDescription>View performance dashboard, reports, and metrics (read-only).</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Investor/Partner specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
