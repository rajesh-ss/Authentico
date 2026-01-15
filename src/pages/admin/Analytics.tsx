import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Shield, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { useAutoRefresh, useDateRangeFilter, useAnalyticsExport } from '@/hooks';
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
import {
  AnalyticsHeader,
  AnalyticsStatsCard,
  IssuanceTrendChart,
  TopProgramsChart,
  VerificationSourceChart,
  VerificationTrendChart,
  FraudLogsTable,
  UserActivityTable,
} from '@/components/analytics';

export default function Analytics() {
  const [issuancePeriod, setIssuancePeriod] = useState<'day' | 'week' | 'month'>('day');

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

  const { exportToCSV, exportToPDF } = useAnalyticsExport();

  // Optimized filtered data - single pass filtering
  const filteredData = useMemo(() => {
    const issuance = issuancePeriod === 'day' 
      ? filterByDateRange(dailyIssuanceData, (d) => d.date)
      : issuancePeriod === 'week' ? weeklyIssuanceData : monthlyIssuanceData;
    
    const verification = filterByDateRange(dailyVerificationData, (d) => d.date);
    const fraud = filterByDateRange(fraudLogs, (d) => d.timestamp);
    const activity = filterByDateRange(userActivityLogs, (d) => d.timestamp);

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

  const verificationSourceData = useMemo(() => [
    { name: 'QR Code', value: verificationStats.qrVerifications },
    { name: 'URL', value: verificationStats.urlVerifications },
    { name: 'API', value: verificationStats.apiVerifications },
  ], []);

  return (
    <DashboardLayout title="Analytics & Reporting" subtitle="Comprehensive insights into credential issuance, verification, and security">
      <div className="space-y-6">
        <AnalyticsHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          setLast7Days={setLast7Days}
          setLast30Days={setLast30Days}
          setLast90Days={setLast90Days}
          lastUpdated={lastUpdated}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          countdown={countdown}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
        />

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
              <AnalyticsStatsCard 
                title="Total Issued (Lifetime)" 
                value={overviewStats.totalCredentialsIssued} 
              />
              <AnalyticsStatsCard 
                title="In Selected Range" 
                value={filteredData.stats.issuedInRange} 
                valueClassName="text-primary"
              />
              <AnalyticsStatsCard 
                title="This Week" 
                value={overviewStats.weekIssued} 
              />
              <AnalyticsStatsCard 
                title="This Month" 
                value={overviewStats.monthIssued} 
              />
            </div>

            <IssuanceTrendChart
              data={filteredData.issuance}
              period={issuancePeriod}
              onPeriodChange={setIssuancePeriod}
              onExport={() => exportToCSV(filteredData.issuance, 'issuance_trend')}
            />

            <TopProgramsChart
              data={overviewStats.topPrograms}
              onExport={() => exportToCSV(overviewStats.topPrograms, 'top_programs')}
            />
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsStatsCard 
                title="In Selected Range" 
                value={filteredData.stats.verificationsInRange} 
              />
              <AnalyticsStatsCard 
                title="Success Rate" 
                value={`${filteredData.stats.successRate}%`} 
                valueClassName="text-green-600"
              />
              <AnalyticsStatsCard 
                title="Failure Rate" 
                value={`${filteredData.stats.failureRate}%`} 
                valueClassName="text-destructive"
              />
              <AnalyticsStatsCard 
                title="Total (Lifetime)" 
                value={verificationStats.totalVerifications} 
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <VerificationSourceChart
                data={verificationSourceData}
                onExport={() => exportToCSV(verificationSourceData, 'verification_sources')}
              />
              <VerificationTrendChart
                data={filteredData.verification}
                onExport={() => exportToCSV(filteredData.verification, 'verification_trend')}
              />
            </div>
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsStatsCard 
                title="Alerts in Range" 
                value={filteredData.stats.fraudAlertsInRange} 
                icon={AlertTriangle}
                iconClassName="text-destructive"
                valueClassName="text-destructive"
                className="border-destructive/50"
              />
              <AnalyticsStatsCard 
                title="High Severity" 
                value={filteredData.stats.highSeverityInRange} 
                valueClassName="text-destructive"
              />
              <AnalyticsStatsCard 
                title="Medium Severity" 
                value={filteredData.stats.mediumSeverityInRange} 
                valueClassName="text-amber-500"
              />
              <AnalyticsStatsCard 
                title="Multiple Failures" 
                value={filteredData.stats.multipleFailuresInRange} 
              />
            </div>

            <FraudLogsTable
              data={filteredData.fraud}
              onExportCSV={() => exportToCSV(filteredData.fraud, 'fraud_logs')}
              onExportPDF={() =>
                exportToPDF('Fraud Detection Logs', filteredData.fraud as unknown as object[], [
                  'Timestamp',
                  'CredentialId',
                  'IpAddress',
                  'IssueType',
                  'Severity',
                ])
              }
            />
          </TabsContent>

          {/* User Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsStatsCard 
                title="Active Issuers" 
                value={filteredData.stats.activeIssuers} 
              />
              <AnalyticsStatsCard 
                title="Actions in Range" 
                value={filteredData.stats.activityCountInRange} 
              />
              <AnalyticsStatsCard 
                title="Successful" 
                value={filteredData.stats.successfulActionsInRange} 
                valueClassName="text-green-600"
              />
              <AnalyticsStatsCard 
                title="Failed" 
                value={filteredData.stats.failedActionsInRange} 
                valueClassName="text-destructive"
              />
            </div>

            <UserActivityTable
              data={filteredData.activity}
              onExportCSV={() => exportToCSV(filteredData.activity, 'user_activity')}
              onExportPDF={() =>
                exportToPDF('User Activity Logs', filteredData.activity as unknown as object[], [
                  'Timestamp',
                  'UserName',
                  'Action',
                  'CredentialsCount',
                  'Status',
                ])
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
