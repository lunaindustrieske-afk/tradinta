

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  imageHint: string;
  rating: number;
  reviewCount: number;
  manufacturerId: string; // Firebase UID of the manufacturer
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

export type Manufacturer = {
  id: string; // Firebase UID
  shopId: string; // Short, unique, URL-friendly ID
  slug: string;
  name: string;
  logoUrl: string;
  coverImageUrl: string;
  industry: string;
  location: string;
  memberSince: number;
  rating: number;
  isVerified: boolean;
  acceptsTradPay: boolean;
  overview: string;
  certifications: string[];
  businessType: string;
  workforceSize: string;
  exportMarkets: string[];
  productionCapacity: string;
  paymentMethods: string[];
  deliveryTerms: string[];
  leadTime: string;
  moq: number;
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
  }[];
};

    
