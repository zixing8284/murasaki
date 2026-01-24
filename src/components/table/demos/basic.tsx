import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

export function BasicDemo() {
  return (
    <Table containerClassName="h-50 w-100">
      <TableCaption>ODBC Drivers</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Company</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>MySQL ODBC 3.51 Driver</TableCell>
          <TableCell>3.51.11.00</TableCell>
          <TableCell>MySQL AB</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>SQL Server</TableCell>
          <TableCell>3.70.06.23</TableCell>
          <TableCell>Microsoft Corporation</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>PostgreSQL ODBC Driver</TableCell>
          <TableCell>9.01.02.00</TableCell>
          <TableCell>PostgreSQL Global Development Group</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Oracle ODBC Driver</TableCell>
          <TableCell>11.2.0.1.0</TableCell>
          <TableCell>Oracle Corporation</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
