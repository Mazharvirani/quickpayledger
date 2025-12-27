import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { InventoryItem, BusinessProfile, Invoice, InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  inventory: InventoryItem[];
  businessProfile: BusinessProfile;
  invoices: Invoice[];
  loading: boolean;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice | null>;
  refreshData: () => Promise<void>;
}

const defaultBusinessProfile: BusinessProfile = {
  name: 'Your Business Name',
  address: '123 Business Street, City, State 12345',
  phone: '+92 300 1234567',
  email: 'contact@yourbusiness.com',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      return;
    }

    const mappedData: InventoryItem[] = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePerUnit: Number(item.price_per_unit),
      unit: item.unit,
    }));
    
    setInventory(mappedData);
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setBusinessProfile({
        name: data.business_name || defaultBusinessProfile.name,
        address: data.business_address || defaultBusinessProfile.address,
        phone: data.business_phone || defaultBusinessProfile.phone,
        email: data.business_email || user.email || defaultBusinessProfile.email,
        logo: data.logo_url || undefined,
      });
    }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return;
    }

    const invoicesWithItems: Invoice[] = await Promise.all(
      (invoicesData || []).map(async (inv) => {
        const { data: itemsData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', inv.id);

        const items: InvoiceItem[] = (itemsData || []).map((item) => ({
          inventoryItemId: item.inventory_item_id || '',
          name: item.name,
          quantity: item.quantity,
          pricePerUnit: Number(item.price_per_unit),
          unit: item.unit,
          total: Number(item.total),
        }));

        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          date: inv.date,
          buyer: {
            name: inv.buyer_name,
            address: inv.buyer_address || '',
            phone: inv.buyer_phone || '',
          },
          items,
          subtotal: Number(inv.subtotal),
          tax: Number(inv.tax) || 0,
          total: Number(inv.total),
          status: inv.status as 'draft' | 'sent' | 'paid',
        };
      })
    );

    setInvoices(invoicesWithItems);
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchInventory(), fetchProfile(), fetchInvoices()]);
    setLoading(false);
  }, [user, fetchInventory, fetchProfile, fetchInvoices]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setInventory([]);
      setInvoices([]);
      setBusinessProfile(defaultBusinessProfile);
      setLoading(false);
    }
  }, [user, refreshData]);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    if (!user) return;

    const { error } = await supabase.from('inventory').insert({
      user_id: user.id,
      name: item.name,
      quantity: item.quantity,
      price_per_unit: item.pricePerUnit,
      unit: item.unit,
    });

    if (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add inventory item',
        variant: 'destructive',
      });
      return;
    }

    await fetchInventory();
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.pricePerUnit !== undefined) updateData.price_per_unit = updates.pricePerUnit;
    if (updates.unit !== undefined) updateData.unit = updates.unit;

    const { error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item',
        variant: 'destructive',
      });
      return;
    }

    await fetchInventory();
  };

  const deleteInventoryItem = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item',
        variant: 'destructive',
      });
      return;
    }

    await fetchInventory();
  };

  const updateBusinessProfile = async (profile: Partial<BusinessProfile>) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (profile.name !== undefined) updateData.business_name = profile.name;
    if (profile.address !== undefined) updateData.business_address = profile.address;
    if (profile.phone !== undefined) updateData.business_phone = profile.phone;
    if (profile.email !== undefined) updateData.business_email = profile.email;
    if (profile.logo !== undefined) updateData.logo_url = profile.logo;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business profile',
        variant: 'destructive',
      });
      return;
    }

    await fetchProfile();
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<Invoice | null> => {
    if (!user) return null;

    // Insert invoice
    const { data: invoiceResult, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        invoice_number: invoiceData.invoiceNumber,
        buyer_name: invoiceData.buyer.name,
        buyer_address: invoiceData.buyer.address,
        buyer_phone: invoiceData.buyer.phone,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax || 0,
        total: invoiceData.total,
        status: invoiceData.status,
        date: invoiceData.date,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
      return null;
    }

    // Insert invoice items
    const itemsToInsert = invoiceData.items.map((item) => ({
      invoice_id: invoiceResult.id,
      inventory_item_id: item.inventoryItemId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price_per_unit: item.pricePerUnit,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
    }

    // Adjust inventory for each item
    for (const item of invoiceData.items) {
      const inventoryItem = inventory.find((i) => i.id === item.inventoryItemId);
      if (inventoryItem) {
        await supabase
          .from('inventory')
          .update({ quantity: Math.max(0, inventoryItem.quantity - item.quantity) })
          .eq('id', item.inventoryItemId);
      }
    }

    await refreshData();

    return {
      ...invoiceData,
      id: invoiceResult.id,
    };
  };

  return (
    <AppContext.Provider
      value={{
        inventory,
        businessProfile,
        invoices,
        loading,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateBusinessProfile,
        createInvoice,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
