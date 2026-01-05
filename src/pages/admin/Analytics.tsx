import React, { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  RefreshCw,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAutoRefresh, useDateRangeFilter } from '@/hooks';
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
  userActivityLogs,
} from '@/data/mockAnalytics';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const [issuancePeriod, setIssuancePeriod] = useState<'day' | 'week' | 'month'>('day');
  const { toast } = useToast();

  // Use custom hooks for cleaner code
  const {
    dateRange,
    setDateRange,
    setLast7Days,
    setLast30Days,
    setLast90Days,
    filterByDateRange,
  } = useDateRangeFilter({ initialDays: 30 });

  const {
    lastUpdated,
    isRefreshing,
    autoRefresh,
    countdown,
    setAutoRefresh,
    refresh,
  } = useAutoRefresh({ interval: 30000 });

  // Optimized filtered data - single pass filtering
  const filteredData = useMemo(() => {
    const issuance = issuancePeriod === 'day' 
      ? filterByDateRange(dailyIssuanceData, (d) => d.date)
      : issuancePeriod === 'week' ? weeklyIssuanceData : monthlyIssuanceData;
    
    const verification = filterByDateRange(dailyVerificationData, (d) => d.date);
    const fraud = filterByDateRange(fraudLogs, (d) => d.timestamp);
    const activity = filterByDateRange(userActivityLogs, (d) => d.timestamp);

    // Calculate all stats in a single pass per array
    const issuedCount = issuance.reduce((sum, d) => sum + d.count, 0);
    
    const verificationAgg = verification.reduce(
      (acc, d) => ({
        total: acc.total + d.total,
        success: acc.success + d.success,
        failed: acc.failed + d.failed,
      }),
      { total: 0, success: 0, failed: 0 }
    );
    
    const fraudAgg = fraud.reduce(
      (acc, d) => ({
        total: acc.total + 1,
        high: acc.high + (d.severity === 'high' ? 1 : 0),
        medium: acc.medium + (d.severity === 'medium' ? 1 : 0),
        multipleFailures: acc.multipleFailures + (d.issueType === 'multiple_failures' ? 1 : 0),
      }),
      { total: 0, high: 0, medium: 0, multipleFailures: 0 }
    );
    
    const activityAgg = activity.reduce(
      (acc, d) => ({
        total: acc.total + 1,
        success: acc.success + (d.status === 'success' ? 1 : 0),
        failed: acc.failed + (d.status === 'failed' ? 1 : 0),
      }),
      { total: 0, success: 0, failed: 0 }
    );

    return {
      issuance,
      verification,
      fraud,
      activity,
      stats: {
        issuedInRange: issuedCount,
        verificationsInRange: verificationAgg.total,
        successRate: verificationAgg.total > 0 
          ? ((verificationAgg.success / verificationAgg.total) * 100).toFixed(1) 
          : '0',
        failureRate: verificationAgg.total > 0 
          ? ((verificationAgg.failed / verificationAgg.total) * 100).toFixed(1) 
          : '0',
        fraudAlertsInRange: fraudAgg.total,
        highSeverityInRange: fraudAgg.high,
        mediumSeverityInRange: fraudAgg.medium,
        multipleFailuresInRange: fraudAgg.multipleFailures,
        activityCountInRange: activityAgg.total,
        successfulActionsInRange: activityAgg.success,
        failedActionsInRange: activityAgg.failed,
        activeIssuers: new Set(activity.map(l => l.userId)).size,
      },
    };
  }, [dateRange, issuancePeriod, filterByDateRange]);

  const exportToCSV = useCallback((data: object[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
    toast({ title: 'Export Successful', description: `${filename}.xlsx has been downloaded` });
  }, [toast]);

  const exportToPDF = useCallback((title: string, data: object[], columns: string[]) => {
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
  }, [toast]);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }, []);

  const verificationSourceData = useMemo(() => [
    { name: 'QR Code', value: verificationStats.qrVerifications, icon: QrCode },
    { name: 'URL', value: verificationStats.urlVerifications, icon: LinkIcon },
    { name: 'API', value: verificationStats.apiVerifications, icon: Code },
  ], []);

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
                  <Button variant="ghost" size="sm" onClick={setLast7Days}>
                    Last 7 days
                  </Button>
                  <Button variant="ghost" size="sm" onClick={setLast30Days}>
                    Last 30 days
                  </Button>
                  <Button variant="ghost" size="sm" onClick={setLast90Days}>
                    Last 90 days
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Auto-refresh Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {format(lastUpdated, 'HH:mm:ss')}
              </span>
            </div>
            {autoRefresh && (
              <Badge variant="secondary" className="text-xs">
                Next refresh in {countdown}s
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                Auto-refresh
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </Button>
          </div>
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
                  <CardTitle className="text-2xl lg:text-3xl text-primary">{filteredData.stats.issuedInRange.toLocaleString()}</CardTitle>
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
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(filteredData.issuance, 'issuance_trend')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData.issuance}>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In Selected Range</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredData.stats.verificationsInRange.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-green-600">{filteredData.stats.successRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Failure Rate</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredData.stats.failureRate}%</CardTitle>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Verification Trend</CardTitle>
                    <CardDescription>Success vs Failure over time</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(filteredData.verification, 'verification_trend')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredData.verification}>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-destructive/50">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Alerts in Range
                  </CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredData.stats.fraudAlertsInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>High Severity</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredData.stats.highSeverityInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Medium Severity</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-amber-500">{filteredData.stats.mediumSeverityInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Multiple Failures</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredData.stats.multipleFailuresInRange}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Suspicious Activity Logs</CardTitle>
                  <CardDescription>Failed or suspicious verification attempts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredData.fraud, 'fraud_logs')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToPDF('Fraud Detection Logs', filteredData.fraud as unknown as object[], [
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
                      {filteredData.fraud.map((log) => (
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
                            <Badge variant={getSeverityColor(log.severity) as any}>{log.severity}</Badge>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Issuers</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredData.stats.activeIssuers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Actions in Range</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl">{filteredData.stats.activityCountInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Successful</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-green-600">{filteredData.stats.successfulActionsInRange}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Failed</CardDescription>
                  <CardTitle className="text-2xl lg:text-3xl text-destructive">{filteredData.stats.failedActionsInRange}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Issuance Activity Log</CardTitle>
                  <CardDescription>User-level credential issuance history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredData.activity, 'user_activity')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToPDF('User Activity Logs', filteredData.activity as unknown as object[], [
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
                      {filteredData.activity.map((log) => (
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
