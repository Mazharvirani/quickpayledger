import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function Invoices() {
  const { invoices } = useApp();

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'sent':
        return <Badge className="bg-primary text-primary-foreground">Sent</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your invoices
          </p>
        </div>
        <Link to="/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="card-elevated">
        {sortedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Link to="/invoices/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-table-hover">
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{invoice.buyer.name}</TableCell>
                  <TableCell>{invoice.items.length} items</TableCell>
                  <TableCell className="text-right font-medium">
                    PKR {invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <Link to={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="icon" className="btn-icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
