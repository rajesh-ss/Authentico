// Analytics mock data for Authentico

export interface IssuanceStat {
  date: string;
  count: number;
}

export interface VerificationStat {
  date: string;
  total: number;
  qr: number;
  url: number;
  api: number;
  success: number;
  failed: number;
}

export interface FraudLog {
  id: string;
  timestamp: string;
  credentialId: string;
  ipAddress: string;
  issueType: 'invalid_signature' | 'expired_credential' | 'tampered_data' | 'multiple_failures' | 'unknown_credential';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: 'issued' | 'failed_issuance' | 'bulk_issued';
  credentialsCount: number;
  timestamp: string;
  status: 'success' | 'failed';
  errorReason?: string;
  batchId?: string;
}

// Overview stats
export const overviewStats = {
  totalCredentialsIssued: 12847,
  todayIssued: 45,
  weekIssued: 312,
  monthIssued: 1256,
  topPrograms: [
    { name: 'Computer Science', count: 3245 },
    { name: 'Mechanical Engineering', count: 2890 },
    { name: 'Business Administration', count: 2456 },
    { name: 'Electrical Engineering', count: 2123 },
    { name: 'Civil Engineering', count: 2133 },
  ],
};

// Daily issuance data (last 30 days)
export const dailyIssuanceData: IssuanceStat[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    count: Math.floor(Math.random() * 80) + 20,
  };
});

// Weekly issuance data (last 12 weeks)
export const weeklyIssuanceData: IssuanceStat[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (11 - i) * 7);
  return {
    date: `Week ${i + 1}`,
    count: Math.floor(Math.random() * 400) + 200,
  };
});

// Monthly issuance data (last 12 months)
export const monthlyIssuanceData: IssuanceStat[] = [
  { date: 'Jan', count: 980 },
  { date: 'Feb', count: 1120 },
  { date: 'Mar', count: 1340 },
  { date: 'Apr', count: 1180 },
  { date: 'May', count: 1420 },
  { date: 'Jun', count: 890 },
  { date: 'Jul', count: 720 },
  { date: 'Aug', count: 650 },
  { date: 'Sep', count: 1280 },
  { date: 'Oct', count: 1450 },
  { date: 'Nov', count: 1320 },
  { date: 'Dec', count: 1256 },
];

// Verification stats
export const verificationStats = {
  totalVerifications: 28456,
  qrVerifications: 15234,
  urlVerifications: 8945,
  apiVerifications: 4277,
  successRate: 96.8,
  failureRate: 3.2,
};

// Daily verification data (last 30 days)
export const dailyVerificationData: VerificationStat[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const total = Math.floor(Math.random() * 200) + 50;
  const qr = Math.floor(total * 0.53);
  const url = Math.floor(total * 0.31);
  const api = total - qr - url;
  const success = Math.floor(total * (0.94 + Math.random() * 0.05));
  return {
    date: date.toISOString().split('T')[0],
    total,
    qr,
    url,
    api,
    success,
    failed: total - success,
  };
});

// Fraud detection logs
export const fraudLogs: FraudLog[] = [
  {
    id: 'fraud-001',
    timestamp: '2024-01-15T14:32:21Z',
    credentialId: 'CERT-2024-00456',
    ipAddress: '192.168.1.105',
    issueType: 'invalid_signature',
    description: 'Digital signature verification failed - signature mismatch detected',
    severity: 'high',
  },
  {
    id: 'fraud-002',
    timestamp: '2024-01-15T12:18:45Z',
    credentialId: 'CERT-2024-00789',
    ipAddress: '10.0.0.52',
    issueType: 'tampered_data',
    description: 'Hash mismatch - credential data appears to be modified',
    severity: 'high',
  },
  {
    id: 'fraud-003',
    timestamp: '2024-01-15T10:45:12Z',
    credentialId: 'CERT-2023-12345',
    ipAddress: '172.16.0.88',
    issueType: 'expired_credential',
    description: 'Attempted verification of expired credential',
    severity: 'low',
  },
  {
    id: 'fraud-004',
    timestamp: '2024-01-14T22:15:33Z',
    credentialId: 'UNKNOWN',
    ipAddress: '203.45.67.89',
    issueType: 'multiple_failures',
    description: '15 failed verification attempts from same IP within 1 hour',
    severity: 'high',
  },
  {
    id: 'fraud-005',
    timestamp: '2024-01-14T18:22:10Z',
    credentialId: 'CERT-FAKE-001',
    ipAddress: '45.123.45.67',
    issueType: 'unknown_credential',
    description: 'Credential ID not found in blockchain registry',
    severity: 'medium',
  },
  {
    id: 'fraud-006',
    timestamp: '2024-01-14T15:08:55Z',
    credentialId: 'CERT-2024-00234',
    ipAddress: '192.168.2.45',
    issueType: 'tampered_data',
    description: 'Student name field modified from original issuance',
    severity: 'high',
  },
  {
    id: 'fraud-007',
    timestamp: '2024-01-14T09:30:22Z',
    credentialId: 'CERT-2023-09876',
    ipAddress: '10.10.10.101',
    issueType: 'invalid_signature',
    description: 'Signature from unrecognized issuing authority',
    severity: 'medium',
  },
  {
    id: 'fraud-008',
    timestamp: '2024-01-13T16:45:18Z',
    credentialId: 'CERT-2024-00567',
    ipAddress: '78.90.12.34',
    issueType: 'multiple_failures',
    description: '8 failed attempts with different credential IDs from same IP',
    severity: 'medium',
  },
];

// Fraud alerts summary
export const fraudAlerts = {
  totalAlerts: 8,
  highSeverity: 4,
  mediumSeverity: 3,
  lowSeverity: 1,
  multipleFailuresDetected: 2,
};

// User activity logs
export const userActivityLogs: UserActivityLog[] = [
  {
    id: 'activity-001',
    userId: 'user-issuer-01',
    userName: 'John Smith',
    action: 'bulk_issued',
    credentialsCount: 125,
    timestamp: '2024-01-15T16:30:00Z',
    status: 'success',
    batchId: 'BATCH-2024-001',
  },
  {
    id: 'activity-002',
    userId: 'user-issuer-02',
    userName: 'Sarah Johnson',
    action: 'issued',
    credentialsCount: 1,
    timestamp: '2024-01-15T15:45:00Z',
    status: 'success',
  },
  {
    id: 'activity-003',
    userId: 'user-issuer-01',
    userName: 'John Smith',
    action: 'failed_issuance',
    credentialsCount: 45,
    timestamp: '2024-01-15T14:20:00Z',
    status: 'failed',
    errorReason: 'Invalid student ID format in 12 records',
    batchId: 'BATCH-2024-002',
  },
  {
    id: 'activity-004',
    userId: 'user-issuer-03',
    userName: 'Michael Chen',
    action: 'bulk_issued',
    credentialsCount: 89,
    timestamp: '2024-01-15T11:10:00Z',
    status: 'success',
    batchId: 'BATCH-2024-003',
  },
  {
    id: 'activity-005',
    userId: 'user-issuer-02',
    userName: 'Sarah Johnson',
    action: 'failed_issuance',
    credentialsCount: 1,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'failed',
    errorReason: 'Duplicate credential ID detected',
  },
  {
    id: 'activity-006',
    userId: 'user-issuer-04',
    userName: 'Emily Davis',
    action: 'bulk_issued',
    credentialsCount: 234,
    timestamp: '2024-01-14T16:00:00Z',
    status: 'success',
    batchId: 'BATCH-2024-004',
  },
  {
    id: 'activity-007',
    userId: 'user-issuer-01',
    userName: 'John Smith',
    action: 'bulk_issued',
    credentialsCount: 156,
    timestamp: '2024-01-14T14:30:00Z',
    status: 'success',
    batchId: 'BATCH-2024-005',
  },
  {
    id: 'activity-008',
    userId: 'user-issuer-03',
    userName: 'Michael Chen',
    action: 'failed_issuance',
    credentialsCount: 67,
    timestamp: '2024-01-14T11:45:00Z',
    status: 'failed',
    errorReason: 'Blockchain connection timeout',
    batchId: 'BATCH-2024-006',
  },
];

// User activity summary
export const userActivitySummary = {
  totalIssuers: 4,
  totalActions: 156,
  successfulActions: 142,
  failedActions: 14,
  averageCredentialsPerAction: 82,
};
