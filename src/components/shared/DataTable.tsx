import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  title,
  keyExtractor,
  emptyMessage = 'No data found',
  className,
}: DataTableProps<T>) {
  const content = (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(item, index)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8">
              <EmptyState message={emptyMessage} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title} ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
