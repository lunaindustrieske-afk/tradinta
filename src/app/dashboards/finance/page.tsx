import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FinanceDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Finance Dashboard</CardTitle>
                <CardDescription>Manages TradPay flow, KYC, and regulatory compliance.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Finance specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
