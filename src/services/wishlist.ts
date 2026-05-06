import { http } from './http';
import type { TravelPackage } from './packages';

export type WishlistItem = {
  _id: string;
  package: TravelPackage;
  createdAt?: string;
};

export async function getWishlist() {
  const { data } = await http.get('/wishlist');
  return data?.data as WishlistItem[];
}

export async function addToWishlist(packageId: string) {
  const { data } = await http.post('/wishlist', { packageId });
  return data?.data as WishlistItem;
}

export async function removeWishlistItem(id: string) {
  const { data } = await http.delete(`/wishlist/${id}`);
  return data;
}

