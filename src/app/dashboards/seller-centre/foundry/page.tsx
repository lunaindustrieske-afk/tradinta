
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, BarChart, Sparkles } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mock data until backend is integrated
const mockEvents = [
  { id: 'EVT-001', product: 'Industrial Grade Cement', partner: 'John Doe', status: 'Active', sales: 450250, endDate: '2024-08-01' },
  { id: 'EVT-002', product: 'Commercial Baking Flour', partner: 'Jane Smith', status: 'Finished', sales: 120000, endDate: '2024-07-15' },
  { id: 'EVT-003', product: 'HDPE Plastic Pellets', partner: 'Kimani Traders', status: 'Proposed', sales: 0, endDate: 'N/A' },
];

export default function FoundryDashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboards/seller-centre">Seller Centre</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>The Foundry</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                The Foundry
              </CardTitle>
              <CardDescription>
                Create and manage collaborative "Forging Events" with Growth
                Partners to forge amazing deals.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboards/seller-centre/foundry/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Propose New Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Attributed Sales (KES)</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockEvents.map(event => (
                        <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.product}</TableCell>
                            <TableCell>{event.partner}</TableCell>
                            <TableCell><Badge variant={event.status === 'Active' ? 'default' : 'outline'}>{event.status}</Badge></TableCell>
                            <TableCell>{event.endDate}</TableCell>
                            <TableCell>{event.sales.toLocaleString()}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">
                                    <BarChart className="mr-2 h-4 w-4" />
                                    View Report
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
