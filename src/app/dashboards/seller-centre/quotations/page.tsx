'use client';

import React from 'react';
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
import { Button } from '@/components/ui/button';
import { BookCopy, Eye, Archive } from 'lucide-react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const quotations = [
  {
    id: 'RFQ-001',
    buyerName: 'BuildRight Const.',
    productName: 'Industrial Grade Cement',
    quantity: 500,
    date: '2023-11-21',
    status: 'New',
  },
  {
    id: 'RFQ-002',
    buyerName: 'Yum Foods',
    productName: 'Commercial Baking Flour',
    quantity: 100,
    date: '2023-11-20',
    status: 'Responded',
  },
  {
    id: 'RFQ-003',
    buyerName: 'Kimani Traders',
    productName: 'Steel Reinforcement Bars (Rebar)',
    quantity: 2000,
    date: '2023-11-19',
    status: 'New',
  },
  {
    id: 'RFQ-004',
    buyerName: 'Office Solutions Ltd',
    productName: 'Recycled Kraft Paper Rolls',
    quantity: 50,
    date: '2023-11-18',
    status: 'Archived',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'New':
      return <Badge variant="default">{status}</Badge>;
    case 'Responded':
      return <Badge variant="secondary">{status}</Badge>;
    case 'Archived':
      return <Badge variant="outline">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const QuotationTable = ({ filterStatus }: { filterStatus: string | 'all' }) => {
  const filteredQuotes =
    filterStatus === 'all'
      ? quotations
      : quotations.filter(
          (q) => q.status.toLowerCase() === filterStatus.toLowerCase()
        );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Buyer</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell className="font-medium">{quote.buyerName}</TableCell>
              <TableCell>{quote.productName}</TableCell>
              <TableCell>{quote.quantity}</TableCell>
              <TableCell>{quote.date}</TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> View & Respond
                </Button>
                {quote.status !== 'Archived' && (
                    <Button variant="ghost" size="sm">
                        <Archive className="mr-2 h-4 w-4" /> Archive
                    </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No quotations in this category.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default function SellerQuotationsPage() {
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
            <BreadcrumbPage>Quotations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookCopy className="w-6 h-6 text-primary" />
            Requests for Quotation (RFQs)
          </CardTitle>
          <CardDescription>
            View and respond to inquiries and price requests from potential buyers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New ({quotations.filter(q => q.status === 'New').length})</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <QuotationTable filterStatus="all" />
            </TabsContent>
            <TabsContent value="new">
              <QuotationTable filterStatus="new" />
            </TabsContent>
            <TabsContent value="responded">
              <QuotationTable filterStatus="responded" />
            </TabsContent>
            <TabsContent value="archived">
              <QuotationTable filterStatus="archived" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
