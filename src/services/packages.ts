import { http } from './http';

export type PackageImage = { url: string; public_id: string };

export type TravelPackage = {
  _id: string;
  title: string;
  description?: string;
  destination: string;
  country?: string;
  duration?: number;
  location?: string;
  category?: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  numReviews?: number;
  images?: PackageImage[];
  availableDates?: string[];
  seats?: number;
  active?: boolean;
};

export type PackagesQuery = {
  search?: string;
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc';
};

export async function fetchPackages(query: PackagesQuery = {}) {
  const { data } = await http.get('/packages', { params: query });
  return data?.data as TravelPackage[];
}

export async function fetchPackageById(id: string) {
  const { data } = await http.get(`/packages/${id}`);
  return data?.data as TravelPackage;
}

