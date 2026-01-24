import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

const drivers = [
  {
    id: "1",
    name: "MySQL ODBC 3.51 Driver",
    version: "3.51.11.00",
    company: "MySQL AB",
  },
  {
    id: "2",
    name: "SQL Server",
    version: "3.70.06.23",
    company: "Microsoft Corporation",
  },
  {
    id: "3",
    name: "PostgreSQL ODBC Driver",
    version: "9.01.02.00",
    company: "PostgreSQL Global Development Group",
  },
  {
    id: "4",
    name: "Oracle ODBC Driver",
    version: "11.2.0.1.0",
    company: "Oracle Corporation",
  },
];

export function InteractiveDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Table containerClassName="h-50 w-125">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Company</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((driver) => (
          <TableRow
            key={driver.id}
            selected={selectedId === driver.id}
            onClick={() => {
              setSelectedId(driver.id);
            }}
          >
            <TableCell>{driver.name}</TableCell>
            <TableCell>{driver.version}</TableCell>
            <TableCell>{driver.company}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
