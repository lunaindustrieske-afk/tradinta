import type { Product, Order, Campaign } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

export const products: Product[] = [
  {
    id: '1',
    name: 'Industrial Grade Cement',
    description: 'High-strength Portland cement suitable for all types of construction projects. Available in 50kg bags.',
    price: 650.00,
    stock: 1200,
    category: 'Building Materials',
    imageUrl: PlaceHolderImages.find(p => p.id === 'product1')?.imageUrl || '',
    imageHint: 'construction cement',
    rating: 4.8,
    reviewCount: 150,
  },
  {
    id: '2',
    name: 'Commercial Baking Flour',
    description: 'Premium quality, all-purpose wheat flour for bakeries and food manufacturers. Sold in 25kg sacks.',
    price: 2200.00,
    stock: 800,
    category: 'Food & Beverage',
    imageUrl: PlaceHolderImages.find(p => p.id === 'product2')?.imageUrl || '',
    imageHint: 'flour sack',
    rating: 4.9,
    reviewCount: 210,
  },
  {
    id: '3',
    name: 'HDPE Plastic Pellets',
    description: 'High-density polyethylene pellets for injection molding and manufacturing plastic goods. 1-ton bulk bags.',
    price: 135000.00,
    stock: 50,
    category: 'Plastics & Polymers',
    imageUrl: PlaceHolderImages.find(p => p.id === 'product3')?.imageUrl || '',
    imageHint: 'plastic pellets',
    rating: 4.7,
    reviewCount: 85,
  },
  {
    id: '4',
    name: 'Recycled Kraft Paper Rolls',
    description: 'Eco-friendly kraft paper rolls for packaging and printing. Various widths and gsm available.',
    price: 8500.00,
    stock: 300,
    category: 'Packaging',
    imageUrl: PlaceHolderImages.find(p => p.id === 'product4')?.imageUrl || '',
    imageHint: 'paper rolls',
    rating: 4.6,
    reviewCount: 120,
  },
  {
    id: '5',
    name: 'Bulk Cooking Oil',
    description: 'Refined sunflower cooking oil supplied in 20-liter jerrycans. Ideal for restaurants and catering businesses.',
    price: 4500.00,
    stock: 500,
    category: 'Food & Beverage',
    imageUrl: PlaceHolderImages.find(p => p.id === 'product5')?.imageUrl || '',
    imageHint: 'cooking oil',
    rating: 4.8,
    reviewCount: 180,
  },
];

export const orders: Order[] = [
  { id: 'ORD-001', productName: 'Industrial Grade Cement', customerName: 'Constructa Ltd', date: '2023-10-26', quantity: 200, total: 130000, status: 'Delivered' },
  { id: 'ORD-002', productName: 'Commercial Baking Flour', customerName: 'SuperBake Bakery', date: '2023-10-25', quantity: 50, total: 110000, status: 'Shipped' },
  { id: 'ORD-003', productName: 'HDPE Plastic Pellets', customerName: 'PlastiCo Kenya', date: '2023-10-25', quantity: 5, total: 675000, status: 'Pending' },
  { id: 'ORD-004', productName: 'Bulk Cooking Oil', customerName: 'Savanna Foods', date: '2023-10-24', quantity: 100, total: 450000, status: 'Delivered' },
  { id: 'ORD-005', productName: 'Recycled Kraft Paper Rolls', customerName: 'PrintPack Solutions', date: '2023-10-23', quantity: 20, total: 170000, status: 'Cancelled' },
];

export const campaigns: Campaign[] = [
    { id: 'CAMP-01', name: 'End of Year Clearance', status: 'Active', startDate: '2023-11-01', endDate: '2023-12-31', budget: 50000, impressions: 120500, clicks: 8230 },
    { id: 'CAMP-02', name: 'New Product Launch: Eco-Pack', status: 'Active', startDate: '2023-10-15', endDate: '2023-11-15', budget: 75000, impressions: 250000, clicks: 15400 },
    { id: 'CAMP-03', name: 'Back to School Special', status: 'Expired', startDate: '2023-08-01', endDate: '2023-08-31', budget: 30000, impressions: 85000, clicks: 4500 },
    { id: 'CAMP-04', name: 'Q1 2024 Planning', status: 'Draft', startDate: '2024-01-01', endDate: '2024-03-31', budget: 100000, impressions: 0, clicks: 0 },
];
