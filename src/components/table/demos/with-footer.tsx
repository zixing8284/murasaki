import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

const invoices = [
  { id: 'INV001', paymentStatus: 'Paid', totalAmount: '$250.00', method: 'Credit Card' },
  { id: 'INV002', paymentStatus: 'Pending', totalAmount: '$150.00', method: 'PayPal' },
  { id: 'INV003', paymentStatus: 'Unpaid', totalAmount: '$350.00', method: 'Bank Transfer' },
  { id: 'INV004', paymentStatus: 'Paid', totalAmount: '$450.00', method: 'Credit Card' },
  { id: 'INV005', paymentStatus: 'Paid', totalAmount: '$550.00', method: 'PayPal' },
  { id: 'INV006', paymentStatus: 'Pending', totalAmount: '$200.00', method: 'Bank Transfer' },
  { id: 'INV007', paymentStatus: 'Unpaid', totalAmount: '$300.00', method: 'Credit Card' },
]

export function WithFooterDemo(): React.ReactElement {
  const total = invoices
    .reduce((acc, invoice) => {
      return acc + Number.parseFloat(invoice.totalAmount.replace('$', ''))
    }, 0)
    .toFixed(2)

  return (
    <Table containerClassName="h-75 w-150">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(invoice => (
          <TableRow key={invoice.id}>
            <TableCell className="font-bold">{invoice.id}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="font-bold">
            Total
          </TableCell>
          <TableCell className="text-right font-bold">
            $
            {total}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
