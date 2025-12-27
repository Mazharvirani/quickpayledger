import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { InventoryItem } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    pricePerUnit: '',
    unit: 'pcs',
  });

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      pricePerUnit: '',
      unit: 'pcs',
    });
    setEditingItem(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      pricePerUnit: item.pricePerUnit.toString(),
      unit: item.unit,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      unit: formData.unit,
    };

    if (editingItem) {
      updateInventoryItem(editingItem.id, itemData);
      toast({
        title: 'Item Updated',
        description: `${itemData.name} has been updated successfully.`,
      });
    } else {
      addInventoryItem(itemData);
      toast({
        title: 'Item Added',
        description: `${itemData.name} has been added to inventory.`,
      });
    }

    handleOpenChange(false);
  };

  const handleDelete = (item: InventoryItem) => {
    deleteInventoryItem(item.id);
    toast({
      title: 'Item Deleted',
      description: `${item.name} has been removed from inventory.`,
      variant: 'destructive',
    });
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and stock levels
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, kg, etc."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit (PKR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingItem ? 'Update' : 'Add'} Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filteredInventory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No items found matching your search.' : 'No inventory items yet. Add your first item!'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price/Unit</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-table-hover">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    PKR {item.pricePerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    PKR {(item.quantity * item.pricePerUnit).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="btn-icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="btn-icon text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
