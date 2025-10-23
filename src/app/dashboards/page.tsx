import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Dashboard</CardTitle>
                    <CardDescription>This is a placeholder for your main dashboard content. Select a role-specific dashboard from the navigation to see more.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Dashboard content goes here...</p>
                </CardContent>
            </Card>
        </div>
    )
}
