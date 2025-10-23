import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Manage the daily functioning of the marketplace and ensure smooth business processes.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Admin specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
