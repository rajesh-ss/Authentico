import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Search, CheckCircle2, XCircle, User, Calendar, Award, Building2, Hash, Loader2, Camera, Upload, FileText } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    id: string; studentName: string; studentId: string; semester: string;
    academicYear: string; institution: string; department: string;
    percentage: number; grade: string; cgpa: number; issuedAt: Date;
    blockchain: { hash: string; blockNumber: number; timestamp: Date };
  };
  error?: string;
}

const mockVerify = async (input: string): Promise<VerificationResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (input.includes('0x8f4a2c') || input.toLowerCase().includes('valid')) {
    return {
      valid: true,
      certificate: {
        id: 'CERT-2024-001234', studentName: 'Alex Thompson', studentId: 'STU2024001234',
        semester: 'Semester 6', academicYear: '2023-24', institution: 'National Institute of Technology',
        department: 'Computer Science & Engineering', percentage: 77.4, grade: 'A', cgpa: 8.2,
        issuedAt: new Date('2024-05-15'),
        blockchain: { hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a', blockNumber: 18234567, timestamp: new Date('2024-05-15T10:30:00') },
      },
    };
  }
  return { valid: false, error: 'Certificate not found or invalid. Please check the hash and try again.' };
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
      setResult(await mockVerify(hashInput));
    } catch {
      setResult({ valid: false, error: 'An error occurred during verification. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <DashboardLayout title="Verify Certificate" subtitle="Verify the authenticity of academic certificates">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Enter Certificate Details</CardTitle>
            <CardDescription>Verify a certificate using transaction hash, certificate ID, or QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="hash"><Hash className="h-4 w-4 mr-2" />Hash/ID</TabsTrigger>
                <TabsTrigger value="scan"><Camera className="h-4 w-4 mr-2" />Scan QR</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="hash">
                <div className="space-y-4">
                  <div>
                    <Label>Transaction Hash or Certificate ID</Label>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Enter hash (0x...) or ID" value={hashInput} onChange={(e) => setHashInput(e.target.value)} className="font-mono" />
                      <Button onClick={handleVerify} disabled={isVerifying || !hashInput.trim()}>
                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span className="ml-2">Verify</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Try: "0x8f4a2c" or "valid" for demo</p>
                </div>
              </TabsContent>

              <TabsContent value="scan">
                <div className="flex flex-col items-center py-8">
                  <div className="h-48 w-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-20 w-20 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground mb-4 text-center">Position the QR code within the frame</p>
                  <Button><Camera className="h-4 w-4 mr-2" />Open Camera</Button>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="flex flex-col items-center py-8">
                  <label className="h-48 w-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground mb-1">Click to upload QR code image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.valid ? 'border-success/50' : 'border-destructive/50'}>
            <CardContent className="pt-6">
              {result.valid && result.certificate ? (
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-success">Certificate Verified</h3>
                      <p className="text-sm text-muted-foreground">Authentic and recorded on blockchain</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoSection icon={User} title="Student">
                      <InfoItem label="Name" value={result.certificate.studentName} />
                      <InfoItem label="ID" value={result.certificate.studentId} mono />
                    </InfoSection>
                    <InfoSection icon={Building2} title="Institution">
                      <InfoItem label="Name" value={result.certificate.institution} />
                      <InfoItem label="Department" value={result.certificate.department} />
                    </InfoSection>
                    <InfoSection icon={Award} title="Academics">
                      <InfoItem label="Semester" value={result.certificate.semester} />
                      <InfoItem label="Year" value={result.certificate.academicYear} />
                      <div className="flex gap-4">
                        <div><p className="text-sm text-muted-foreground">%</p><p className="font-medium">{result.certificate.percentage}%</p></div>
                        <div><p className="text-sm text-muted-foreground">Grade</p><Badge variant="outline">{result.certificate.grade}</Badge></div>
                        <div><p className="text-sm text-muted-foreground">CGPA</p><p className="font-medium">{result.certificate.cgpa}</p></div>
                      </div>
                    </InfoSection>
                    <InfoSection icon={FileText} title="Certificate">
                      <InfoItem label="ID" value={result.certificate.id} mono />
                      <InfoItem label="Issued" value={result.certificate.issuedAt.toLocaleDateString()} />
                    </InfoSection>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground mb-4"><Hash className="h-4 w-4" />Blockchain</h4>
                    <div className="grid gap-3 md:grid-cols-3 pl-6">
                      <div><p className="text-sm text-muted-foreground">Hash</p><TransactionHash hash={result.certificate.blockchain.hash} /></div>
                      <div><p className="text-sm text-muted-foreground">Block</p><p className="font-mono">#{result.certificate.blockchain.blockNumber}</p></div>
                      <div><p className="text-sm text-muted-foreground">Time</p><p>{result.certificate.blockchain.timestamp.toLocaleString()}</p></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg text-destructive mb-2">Verification Failed</h3>
                  <p className="text-muted-foreground text-center max-w-md">{result.error}</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setResult(null); setHashInput(''); }}>Try Again</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">How Verification Works</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Certificates are cryptographically signed on blockchain', 'Transaction hash is unique identifier', 'QR codes contain verification hash', 'Verification is instant and tamper-proof'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" /><span>{item}</span></li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoSection({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" />{title}</h4>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="text-sm text-muted-foreground">{label}</p><p className={`font-medium ${mono ? 'font-mono' : ''}`}>{value}</p></div>;
}
