export type UserRole = 'admin' | 'agent';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  user_id?: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Villa';
  listing_type?: 'sale' | 'rent';
  imageUrl: string;
  image_url?: string; // Optional for raw DB data
  images?: string[]; // Array of image URLs
  description: string;
  features: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface SearchFilters {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
}