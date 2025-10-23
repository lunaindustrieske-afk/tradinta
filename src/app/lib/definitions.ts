export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  imageHint: string;
  rating: number;
  reviewCount: number;
};

export type Order = {
  id: string;
  productName: string;
  customerName: string;
  date: string;
  quantity: number;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
};

export type Campaign = {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Expired';
  startDate: string;
  endDate: string;
  budget: number;
  impressions: number;
  clicks: number;
};
