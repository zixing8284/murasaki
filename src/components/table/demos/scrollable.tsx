import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

const data = [
  { id: 1, name: "AUTOEXEC.BAT", size: "1.2 KB", type: "MS-DOS Batch File", modified: "1998-05-11" },
  { id: 2, name: "CONFIG.SYS", size: "856 bytes", type: "System Configuration", modified: "1998-05-11" },
  { id: 3, name: "COMMAND.COM", size: "93.8 KB", type: "MS-DOS Application", modified: "1998-05-11" },
  { id: 4, name: "WIN.INI", size: "3.4 KB", type: "Configuration Settings", modified: "1998-06-15" },
  { id: 5, name: "SYSTEM.INI", size: "2.8 KB", type: "Configuration Settings", modified: "1998-06-15" },
  { id: 6, name: "MSDOS.SYS", size: "1.6 KB", type: "System File", modified: "1998-05-11" },
  { id: 7, name: "IO.SYS", size: "223 KB", type: "System File", modified: "1998-05-11" },
  { id: 8, name: "BOOTLOG.TXT", size: "12.4 KB", type: "Text Document", modified: "1999-01-23" },
  { id: 9, name: "DETLOG.TXT", size: "8.7 KB", type: "Text Document", modified: "1998-09-14" },
  { id: 10, name: "SETUPLOG.TXT", size: "5.2 KB", type: "Text Document", modified: "1998-05-11" },
  { id: 11, name: "SCANDISK.LOG", size: "2.1 KB", type: "Text Document", modified: "1998-12-08" },
  { id: 12, name: "NETLOG.TXT", size: "4.5 KB", type: "Text Document", modified: "1998-11-20" },
  { id: 13, name: "WINDOWS", size: "-", type: "File Folder", modified: "1998-05-11" },
  { id: 14, name: "PROGRAM FILES", size: "-", type: "File Folder", modified: "1998-06-01" },
  { id: 15, name: "MY DOCUMENTS", size: "-", type: "File Folder", modified: "1998-07-15" },
];

export function ScrollableDemo() {
  return (
    <Table containerClassName="h-62.5 w-150">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date Modified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.size}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.modified}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
