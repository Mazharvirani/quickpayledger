import { useApp } from '@/context/AppContext';
import { StatCard } from '@/components/StatCard';
import { Package, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { inventory, invoices } = useApp();

  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.pricePerUnit,
    0
  );

  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  
  const lowStockItems = inventory.filter((item) => item.quantity <= 5);
  
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your business
          </p>
        </div>
        <Link to="/invoices/new">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={inventory.length}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Inventory Value"
          value={`PKR ${totalInventoryValue.toLocaleString()}`}
          icon={<span className="text-lg font-bold">₨</span>}
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Revenue"
          value={`PKR ${totalInvoiceValue.toLocaleString()}`}
          icon={<span className="text-lg font-bold">₨</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">All items are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-warning/10 rounded-lg"
                >
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="text-warning border-warning">
                    {item.quantity} {item.unit} left
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <Link to="/invoices">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invoices yet. Create your first invoice!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.buyer.name}</TableCell>
                    <TableCell className="text-right">PKR {invoice.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
