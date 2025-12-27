import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { InvoiceItem, BuyerDetails } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { inventory, createInvoice, invoices } = useApp();
  
  const [buyer, setBuyer] = useState<BuyerDetails>({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');

  const generateInvoiceNumber = () => {
    const count = invoices.length + 1;
    const year = new Date().getFullYear();
    return `INV-${year}-${count.toString().padStart(4, '0')}`;
  };

  // Calculate already added quantity for a specific item in current invoice
  const getAddedQuantity = (itemId: string) => {
    const existingItem = items.find((i) => i.inventoryItemId === itemId);
    return existingItem ? existingItem.quantity : 0;
  };

  const addItem = () => {
    const inventoryItem = inventory.find((i) => i.id === selectedItemId);
    if (!inventoryItem) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a valid quantity.',
        variant: 'destructive',
      });
      return;
    }

    // Calculate available stock (accounting for items already added to invoice)
    const alreadyAdded = getAddedQuantity(selectedItemId);
    const availableStock = inventoryItem.quantity - alreadyAdded;

    if (qty > availableStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${availableStock} ${inventoryItem.unit} available.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if item already exists
    const existingIndex = items.findIndex((i) => i.inventoryItemId === selectedItemId);
    if (existingIndex >= 0) {
      const newItems = [...items];
      const newQty = newItems[existingIndex].quantity + qty;
      newItems[existingIndex].quantity = newQty;
      newItems[existingIndex].total = newQty * inventoryItem.pricePerUnit;
      setItems(newItems);
    } else {
      const newItem: InvoiceItem = {
        inventoryItemId: inventoryItem.id,
        name: inventoryItem.name,
        quantity: qty,
        pricePerUnit: inventoryItem.pricePerUnit,
        unit: inventoryItem.unit,
        total: qty * inventoryItem.pricePerUnit,
      };
      setItems([...items, newItem]);
    }

    setSelectedItemId('');
    setQuantity('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = parseFloat(discount) || 0;
  const taxAmount = (subtotal - discountAmount) * ((parseFloat(tax) || 0) / 100);
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one item to the invoice.',
        variant: 'destructive',
      });
      return;
    }

    if (!buyer.name || !buyer.address || !buyer.phone) {
      toast({
        title: 'Missing Buyer Details',
        description: 'Please fill in all required buyer details.',
        variant: 'destructive',
      });
      return;
    }

    const invoice = await createInvoice({
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      buyer,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      notes: notes || undefined,
      status: 'draft',
    });

    if (invoice) {
      toast({
        title: 'Invoice Created',
        description: `Invoice ${invoice.invoiceNumber} has been created.`,
      });

      navigate(`/invoices/${invoice.id}`);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Buyer Details */}
          <div className="lg:col-span-1">
            <div className="form-section">
              <h2 className="text-lg font-semibold mb-4">Buyer Details</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buyer-name">Name *</Label>
                  <Input
                    id="buyer-name"
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    placeholder="Buyer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-address">Address *</Label>
                  <Textarea
                    id="buyer-address"
                    value={buyer.address}
                    onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                    placeholder="Buyer address"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-phone">Phone *</Label>
                  <Input
                    id="buyer-phone"
                    type="tel"
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-email">Email</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    placeholder="buyer@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-gstin">GSTIN / Tax ID</Label>
                  <Input
                    id="buyer-gstin"
                    value={buyer.gstin}
                    onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value })}
                    placeholder="Tax ID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-2">
            <div className="form-section mb-6">
              <h2 className="text-lg font-semibold mb-4">Add Items</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => {
                        const available = item.quantity - getAddedQuantity(item.id);
                        return (
                          <SelectItem key={item.id} value={item.id} disabled={available <= 0}>
                            {item.name} (PKR {item.pricePerUnit}/{item.unit}) - {available} available
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                <Button type="button" onClick={addItem} disabled={!selectedItemId || !quantity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Items Table */}
            <div className="card-elevated mb-6">
              {items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No items added yet. Select a product and add it to the invoice.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">PKR {item.pricePerUnit.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">PKR {item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="btn-icon text-destructive hover:text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Totals */}
            <div className="form-section">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (PKR)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>PKR {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">-PKR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({tax}%)</span>
                    <span>PKR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>PKR {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </div>
  );
}
