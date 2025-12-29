import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  FileText,
  TrendingUp,
  Shield,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  QrCode,
  Link as LinkIcon,
  Code,
  CalendarIcon,
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  overviewStats,
  dailyIssuanceData,
  weeklyIssuanceData,
  monthlyIssuanceData,
  verificationStats,
  dailyVerificationData,
  fraudLogs,
  fraudAlerts,
  userActivityLogs,
  userActivitySummary,
} from '@/data/mockAnalytics';
import type { DateRange } from 'react-day-picker';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const [issuancePeriod, setIssuancePeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { toast } = useToast();

  // Filter functions based on date range
  const filterByDateRange = <T extends { date?: string; timestamp?: string }>(
    data: T[],
    dateField: 'date' | 'timestamp' = 'date'
  ): T[] => {
    if (!dateRange?.from || !dateRange?.to) return data;
    return data.filter((item) => {
      const itemDate = new Date(item[dateField] || '');
      return isWithinInterval(itemDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      });
    });
  };

  // Filtered data
  const filteredIssuanceData = useMemo(() => {
    const data = issuancePeriod === 'day' ? dailyIssuanceData : issuancePeriod === 'week' ? weeklyIssuanceData : monthlyIssuanceData;
    if (issuancePeriod !== 'day') return data; // Weekly/monthly data doesn't have ISO dates
    return filterByDateRange(data, 'date');
  }, [dateRange, issuancePeriod]);

  const filteredVerificationData = useMemo(() => filterByDateRange(dailyVerificationData, 'date'), [dateRange]);
  
  const filteredFraudLogs = useMemo(() => filterByDateRange(fraudLogs, 'timestamp'), [dateRange]);
  
  const filteredActivityLogs = useMemo(() => filterByDateRange(userActivityLogs, 'timestamp'), [dateRange]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const issuedInRange = filteredIssuanceData.reduce((sum, d) => sum + d.count, 0);
    const verificationsInRange = filteredVerificationData.reduce((sum, d) => sum + d.total, 0);
    const successInRange = filteredVerificationData.reduce((sum, d) => sum + d.success, 0);
    const failedInRange = filteredVerificationData.reduce((sum, d) => sum + d.failed, 0);
    const successRate = verificationsInRange > 0 ? ((successInRange / verificationsInRange) * 100).toFixed(1) : '0';
    const failureRate = verificationsInRange > 0 ? ((failedInRange / verificationsInRange) * 100).toFixed(1) : '0';
    
    return {
      issuedInRange,
      verificationsInRange,
      successRate,
      failureRate,
      fraudAlertsInRange: filteredFraudLogs.length,
      highSeverityInRange: filteredFraudLogs.filter(l => l.severity === 'high').length,
      activityCountInRange: filteredActivityLogs.length,
      successfulActionsInRange: filteredActivityLogs.filter(l => l.status === 'success').length,
      failedActionsInRange: filteredActivityLogs.filter(l => l.status === 'failed').length,
    };
  }, [filteredIssuanceData, filteredVerificationData, filteredFraudLogs, filteredActivityLogs]);

  const getIssuanceData = () => {
    switch (issuancePeriod) {
      case 'week':
        return weeklyIssuanceData;
      case 'month':
        return monthlyIssuanceData;
      default:
        return dailyIssuanceData;
    }
  };

  const exportToCSV = (data: object[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
    toast({ title: 'Export Successful', description: `${filename}.xlsx has been downloaded` });
  };

  const exportToPDF = (title: string, data: object[], columns: string[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 30);

    autoTable(doc, {
      head: [columns],
      body: data.map((row) => columns.map((col) => (row as Record<string, unknown>)[col.toLowerCase().replace(/ /g, '')] ?? '')),
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
    toast({ title: 'Export Successful', description: `${title}.pdf has been downloaded` });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const verificationSourceData = [
    { name: 'QR Code', value: verificationStats.qrVerifications, icon: QrCode },
    { name: 'URL', value: verificationStats.urlVerifications, icon: LinkIcon },
    { name: 'API', value: verificationStats.apiVerifications, icon: Code },
  ];

  return (
    <DashboardLayout title="Analytics & Reporting" subtitle="Comprehensive insights into credential issuance, verification, and security">
      <div className="space-y-6">
        {/* Page Header with Date Range Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics & Reporting</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into credential issuance, verification, and security
            </p>
          </div>
          
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal min-w-[280px]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
              <div className="flex items-center justify-between p-3 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })}
                  >
                    Last 90 days
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="fraud" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Fraud Detection</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Issued (Lifetime)</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{overviewStats.totalCredentialsIssued.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In Selected Range</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-primary">{filteredStats.issuedInRange.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>This Week</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{overviewStats.weekIssued}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{overviewStats.monthIssued.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Issuance Trend Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Issuance Trend</CardTitle>
                  <CardDescription>Credentials issued over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={issuancePeriod} onValueChange={(v) => setIssuancePeriod(v as 'day' | 'week' | 'month')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(filteredIssuanceData, 'issuance_trend')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredIssuanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Programs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Programs by Issuance</CardTitle>
                  <CardDescription>Highest volume programs</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => exportToCSV(overviewStats.topPrograms, 'top_programs')}>
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewStats.topPrograms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={150} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            {/* Verification Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In Selected Range</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredStats.verificationsInRange.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-green-600">{filteredStats.successRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Failure Rate</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredStats.failureRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total (Lifetime)</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{verificationStats.totalVerifications.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Source Breakdown */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Verification Source</CardTitle>
                    <CardDescription>Breakdown by method</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(verificationSourceData, 'verification_sources')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={verificationSourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {verificationSourceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Trend */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Verification Trend</CardTitle>
                    <CardDescription>Success vs Failure over time</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(filteredVerificationData, 'verification_trend')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredVerificationData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="success" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                        <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud" className="space-y-6">
            {/* Alerts Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-destructive/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Alerts in Range
                  </CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredStats.fraudAlertsInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>High Severity</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredStats.highSeverityInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Medium Severity</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-amber-500">{filteredFraudLogs.filter(l => l.severity === 'medium').length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Multiple Failures</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredFraudLogs.filter(l => l.issueType === 'multiple_failures').length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Fraud Logs Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Suspicious Activity Logs</CardTitle>
                  <CardDescription>Failed or suspicious verification attempts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredFraudLogs, 'fraud_logs')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToPDF('Fraud Detection Logs', filteredFraudLogs as unknown as object[], [
                        'Timestamp',
                        'CredentialId',
                        'IpAddress',
                        'IssueType',
                        'Severity',
                      ])
                    }
                  >
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
                      {filteredFraudLogs.map((log) => (
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
                            <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{log.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {/* Activity Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Issuers</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{new Set(filteredActivityLogs.map(l => l.userId)).size}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Actions in Range</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredStats.activityCountInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Successful</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-green-600">{filteredStats.successfulActionsInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Failed</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredStats.failedActionsInRange}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* User Activity Logs Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Issuance Activity Log</CardTitle>
                  <CardDescription>User-level credential issuance history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredActivityLogs, 'user_activity')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToPDF('User Activity Logs', filteredActivityLogs as unknown as object[], [
                        'Timestamp',
                        'UserName',
                        'Action',
                        'CredentialsCount',
                        'Status',
                      ])
                    }
                  >
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
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Credentials</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActivityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.credentialsCount}</TableCell>
                          <TableCell>
                            {log.status === 'success' ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            {log.errorReason ? (
                              <span className="text-destructive text-sm">{log.errorReason}</span>
                            ) : log.batchId ? (
                              <span className="font-mono text-xs">{log.batchId}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
