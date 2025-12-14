export interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Villa';
  imageUrl: string;
  image_url?: string; // Optional for raw DB data
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