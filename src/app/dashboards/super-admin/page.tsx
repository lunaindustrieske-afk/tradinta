import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SuperAdminDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Super Admin Dashboard</CardTitle>
                <CardDescription>Full control of the platform. Oversee all operations, users, and configurations.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Super admin specific components and data will go here.</p>
            </CardContent>
        </Card>
    );
}
