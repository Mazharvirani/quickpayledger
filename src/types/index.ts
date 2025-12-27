export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
}

export interface BusinessProfile {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  gstin?: string;
}

export interface BuyerDetails {
  name: string;
  address: string;
  phone: string;
  email?: string;
  gstin?: string;
}

export interface InvoiceItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  buyer: BuyerDetails;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid';
}
