import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ViewInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, businessProfile } = useApp();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Invoice not found</h2>
          <Button className="mt-4" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Created on {format(new Date(invoice.date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="invoice-preview max-w-4xl mx-auto" ref={invoiceRef}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-4">
            {businessProfile.logo ? (
              <img
                src={businessProfile.logo}
                alt="Business Logo"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{businessProfile.name}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {businessProfile.address}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-3xl font-bold text-primary">INVOICE</h3>
            <p className="text-lg font-medium mt-1">{invoice.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">
              Date: {format(new Date(invoice.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Business & Buyer Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">FROM</h4>
            <p className="font-medium">{businessProfile.name}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {businessProfile.address}
            </p>
            <p className="text-sm text-muted-foreground">{businessProfile.phone}</p>
            <p className="text-sm text-muted-foreground">{businessProfile.email}</p>
            {businessProfile.gstin && (
              <p className="text-sm text-muted-foreground">GSTIN: {businessProfile.gstin}</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h4>
            <p className="font-medium">{invoice.buyer.name}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {invoice.buyer.address}
            </p>
            <p className="text-sm text-muted-foreground">{invoice.buyer.phone}</p>
            {invoice.buyer.email && (
              <p className="text-sm text-muted-foreground">{invoice.buyer.email}</p>
            )}
            {invoice.buyer.gstin && (
              <p className="text-sm text-muted-foreground">GSTIN: {invoice.buyer.gstin}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-table-header">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right">PKR {item.pricePerUnit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">PKR {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>PKR {invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-PKR {invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax && invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>PKR {invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
              <span>Total</span>
              <span className="text-primary">PKR {invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
