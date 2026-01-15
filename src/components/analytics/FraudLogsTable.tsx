import { useCallback } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { FraudLog } from '@/data/mockAnalytics';

interface FraudLogsTableProps {
  data: FraudLog[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function FraudLogsTable({ data, onExportCSV, onExportPDF }: FraudLogsTableProps) {
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suspicious Activity Logs</CardTitle>
          <CardDescription>Failed or suspicious verification attempts</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Credential ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.credentialId}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.issueType.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{log.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
