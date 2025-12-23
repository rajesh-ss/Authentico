import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle,
  FileText,
  User,
  Calendar,
  Award,
  Building2,
  Hash,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    id: string;
    studentName: string;
    studentId: string;
    semester: string;
    academicYear: string;
    institution: string;
    department: string;
    percentage: number;
    grade: string;
    cgpa: number;
    issuedAt: Date;
    blockchain: {
      hash: string;
      blockNumber: number;
      timestamp: Date;
    };
  };
  error?: string;
}

// Mock verification function
const mockVerify = async (input: string): Promise<VerificationResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate successful verification for specific inputs
  if (input.includes('0x8f4a2c') || input.toLowerCase().includes('valid')) {
    return {
      valid: true,
      certificate: {
        id: 'CERT-2024-001234',
        studentName: 'Alex Thompson',
        studentId: 'STU2024001234',
        semester: 'Semester 6',
        academicYear: '2023-24',
        institution: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        percentage: 77.4,
        grade: 'A',
        cgpa: 8.2,
        issuedAt: new Date('2024-05-15'),
        blockchain: {
          hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
          blockNumber: 18234567,
          timestamp: new Date('2024-05-15T10:30:00'),
        },
      },
    };
  }
  
  return {
    valid: false,
    error: 'Certificate not found or invalid. Please check the hash and try again.',
  };
};

export default function VerifyCertificate() {
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [activeTab, setActiveTab] = useState('hash');

  const handleVerify = async () => {
    if (!hashInput.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    
    try {
      const verificationResult = await mockVerify(hashInput);
      setResult(verificationResult);
    } catch (error) {
      setResult({
        valid: false,
        error: 'An error occurred during verification. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanQr = () => {
    // Mock QR scan - in real app would access camera
    console.log('Opening QR scanner...');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock file processing - in real app would extract QR from image
      console.log('Processing file:', file.name);
    }
  };

  return (
    <DashboardLayout
      title="Verify Certificate"
      subtitle="Verify the authenticity of academic certificates"
    >
      <div className="max-w-3xl mx-auto">
        {/* Verification Input Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Enter Certificate Details</CardTitle>
            <CardDescription>
              Verify a certificate using transaction hash, certificate ID, or QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="hash">
                  <Hash className="h-4 w-4 mr-2" />
                  Hash/ID
                </TabsTrigger>
                <TabsTrigger value="scan">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan QR
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hash">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hash">Transaction Hash or Certificate ID</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="hash"
                        placeholder="Enter transaction hash (0x...) or certificate ID"
                        value={hashInput}
                        onChange={(e) => setHashInput(e.target.value)}
                        className="font-mono"
                      />
                      <Button onClick={handleVerify} disabled={isVerifying || !hashInput.trim()}>
                        {isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span className="ml-2">Verify</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: Try entering "0x8f4a2c" or "valid" to see a successful verification
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="scan">
                <div className="flex flex-col items-center py-8">
                  <div className="h-48 w-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-20 w-20 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground mb-4 text-center">
                    Position the QR code within the frame to scan
                  </p>
                  <Button onClick={handleScanQr}>
                    <Camera className="h-4 w-4 mr-2" />
                    Open Camera
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="flex flex-col items-center py-8">
                  <label 
                    htmlFor="qr-upload" 
                    className="h-48 w-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground mb-1">Click to upload QR code image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </label>
                  <input
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <Card className={result.valid ? 'border-success/50' : 'border-destructive/50'}>
            <CardContent className="pt-6">
              {result.valid && result.certificate ? (
                <div>
                  {/* Success Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-success">Certificate Verified</h3>
                      <p className="text-sm text-muted-foreground">
                        This certificate is authentic and recorded on the blockchain
                      </p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Student Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Student Information
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{result.certificate.studentName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Student ID</p>
                          <p className="font-mono">{result.certificate.studentId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Institution */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        Institution
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{result.certificate.institution}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p>{result.certificate.department}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        Academic Details
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Semester</p>
                          <p className="font-medium">{result.certificate.semester}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Academic Year</p>
                          <p>{result.certificate.academicYear}</p>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Percentage</p>
                            <p className="font-medium">{result.certificate.percentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Grade</p>
                            <Badge variant="outline">{result.certificate.grade}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CGPA</p>
                            <p className="font-medium">{result.certificate.cgpa}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Certificate Info
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Certificate ID</p>
                          <p className="font-mono">{result.certificate.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Issued Date</p>
                          <p>{result.certificate.issuedAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground mb-4">
                      <Hash className="h-4 w-4" />
                      Blockchain Record
                    </h4>
                    <div className="grid gap-3 md:grid-cols-3 pl-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Transaction Hash</p>
                        <TransactionHash hash={result.certificate.blockchain.hash} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Block Number</p>
                        <p className="font-mono">#{result.certificate.blockchain.blockNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Timestamp</p>
                        <p>{result.certificate.blockchain.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg text-destructive mb-2">Verification Failed</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {result.error}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      setResult(null);
                      setHashInput('');
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        {!result && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">How Verification Works</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                  <span>Each certificate is cryptographically signed and stored on the blockchain</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                  <span>The transaction hash serves as a unique identifier for each certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                  <span>QR codes contain the verification hash for easy scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                  <span>Verification is instant and tamper-proof</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
