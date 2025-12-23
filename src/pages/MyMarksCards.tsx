import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { 
  FileText, 
  Download, 
  Eye, 
  QrCode, 
  Search, 
  ArrowLeft,
  RefreshCcw,
  Calendar,
  Award,
  CheckCircle2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MarksCard {
  id: string;
  semester: string;
  academicYear: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  cgpa: number;
  status: 'issued' | 'reevaluated' | 'superseded';
  version: number;
  issuedAt: Date;
  subjects: {
    code: string;
    name: string;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    maxMarks: number;
    grade: string;
    credits: number;
  }[];
  blockchain: {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: Date;
  };
}

// Mock data for student's marks cards with full details
const studentMarksCards: MarksCard[] = [
  {
    id: '1',
    semester: 'Semester 6',
    academicYear: '2023-24',
    totalMarks: 542,
    maxMarks: 700,
    percentage: 77.4,
    grade: 'A',
    cgpa: 8.2,
    status: 'issued',
    version: 1,
    issuedAt: new Date('2024-05-15'),
    subjects: [
      { code: 'CS601', name: 'Machine Learning', internalMarks: 22, externalMarks: 50, totalMarks: 72, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS602', name: 'Data Structures', internalMarks: 18, externalMarks: 47, totalMarks: 65, maxMarks: 100, grade: 'B+', credits: 4 },
      { code: 'CS603', name: 'Algorithms', internalMarks: 20, externalMarks: 38, totalMarks: 58, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS604', name: 'Database Systems', internalMarks: 25, externalMarks: 53, totalMarks: 78, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS605', name: 'Computer Networks', internalMarks: 23, externalMarks: 47, totalMarks: 70, maxMarks: 100, grade: 'A', credits: 3 },
      { code: 'CS606', name: 'Software Engineering', internalMarks: 24, externalMarks: 51, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 3 },
      { code: 'CS607', name: 'Project Work', internalMarks: 90, externalMarks: 34, totalMarks: 124, maxMarks: 200, grade: 'B+', credits: 6 },
    ],
    blockchain: {
      hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
      status: 'confirmed',
      blockNumber: 18234567,
      timestamp: new Date('2024-05-15T10:30:00'),
    },
  },
  {
    id: '2',
    semester: 'Semester 5',
    academicYear: '2023-24',
    totalMarks: 498,
    maxMarks: 700,
    percentage: 71.1,
    grade: 'B+',
    cgpa: 7.8,
    status: 'reevaluated',
    version: 2,
    issuedAt: new Date('2024-01-10'),
    subjects: [
      { code: 'CS501', name: 'Operating Systems', internalMarks: 20, externalMarks: 48, totalMarks: 68, maxMarks: 100, grade: 'B+', credits: 4 },
      { code: 'CS502', name: 'Software Engineering', internalMarks: 22, externalMarks: 53, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS503', name: 'Web Technologies', internalMarks: 25, externalMarks: 57, totalMarks: 82, maxMarks: 100, grade: 'A+', credits: 3 },
      { code: 'CS504', name: 'Compiler Design', internalMarks: 15, externalMarks: 40, totalMarks: 55, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS505', name: 'Cloud Computing', internalMarks: 21, externalMarks: 44, totalMarks: 65, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS506', name: 'Cryptography', internalMarks: 19, externalMarks: 38, totalMarks: 57, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS507', name: 'Mini Project', internalMarks: 70, externalMarks: 26, totalMarks: 96, maxMarks: 200, grade: 'C+', credits: 4 },
    ],
    blockchain: {
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed',
      blockNumber: 18123456,
      timestamp: new Date('2024-01-10T14:20:00'),
    },
  },
  {
    id: '3',
    semester: 'Semester 4',
    academicYear: '2022-23',
    totalMarks: 512,
    maxMarks: 700,
    percentage: 73.1,
    grade: 'A',
    cgpa: 7.9,
    status: 'issued',
    version: 1,
    issuedAt: new Date('2023-06-20'),
    subjects: [
      { code: 'CS401', name: 'Theory of Computation', internalMarks: 18, externalMarks: 52, totalMarks: 70, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS402', name: 'Design Patterns', internalMarks: 23, externalMarks: 45, totalMarks: 68, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS403', name: 'Computer Architecture', internalMarks: 21, externalMarks: 54, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS404', name: 'Discrete Mathematics', internalMarks: 20, externalMarks: 42, totalMarks: 62, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS405', name: 'Artificial Intelligence', internalMarks: 24, externalMarks: 56, totalMarks: 80, maxMarks: 100, grade: 'A+', credits: 4 },
      { code: 'CS406', name: 'Mobile App Development', internalMarks: 22, externalMarks: 45, totalMarks: 67, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS407', name: 'Lab Work', internalMarks: 60, externalMarks: 30, totalMarks: 90, maxMarks: 200, grade: 'C+', credits: 4 },
    ],
    blockchain: {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed',
      blockNumber: 17234567,
      timestamp: new Date('2023-06-20T09:15:00'),
    },
  },
];

const statusBadgeVariant = {
  issued: 'issued' as const,
  reevaluated: 'reevaluated' as const,
  superseded: 'superseded' as const,
};

export default function MyMarksCards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<MarksCard | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrCard, setQrCard] = useState<MarksCard | null>(null);

  const filteredCards = studentMarksCards.filter(card => 
    card.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.academicYear.includes(searchQuery)
  );

  const handleViewDetails = (card: MarksCard) => {
    setSelectedCard(card);
  };

  const handleShowQr = (card: MarksCard) => {
    setQrCard(card);
    setShowQrDialog(true);
  };

  const handleDownload = (card: MarksCard) => {
    // Mock download - in real app would generate PDF
    console.log('Downloading:', card.id);
  };

  if (selectedCard) {
    return (
      <DashboardLayout
        title={selectedCard.semester}
        subtitle={`Academic Year ${selectedCard.academicYear}`}
      >
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => setSelectedCard(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Cards
          </Button>

          {/* Card Header Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{selectedCard.semester}</h2>
                      <Badge variant={statusBadgeVariant[selectedCard.status]}>
                        {selectedCard.status === 'reevaluated' ? `v${selectedCard.version}` : 'Original'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {selectedCard.academicYear} • Issued {selectedCard.issuedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedCard)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShowQr(selectedCard)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/request-reevaluation">
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Request Re-evaluation
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="text-2xl font-bold">{selectedCard.totalMarks}/{selectedCard.maxMarks}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">{selectedCard.percentage}%</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="text-2xl font-bold">{selectedCard.grade}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-2xl font-bold">{selectedCard.cgpa}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Subject-wise Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Internal</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">External</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Grade</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCard.subjects.map((subject) => (
                      <tr key={subject.code} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-sm">{subject.code}</td>
                        <td className="py-3 px-4">{subject.name}</td>
                        <td className="py-3 px-4 text-center">{subject.internalMarks}</td>
                        <td className="py-3 px-4 text-center">{subject.externalMarks}</td>
                        <td className="py-3 px-4 text-center font-medium">{subject.totalMarks}/{subject.maxMarks}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{subject.grade}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">{subject.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <TransactionBadge status={selectedCard.blockchain.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction Hash</span>
                  <TransactionHash hash={selectedCard.blockchain.hash} />
                </div>
                {selectedCard.blockchain.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Block Number</span>
                    <span className="font-mono">#{selectedCard.blockchain.blockNumber}</span>
                  </div>
                )}
                {selectedCard.blockchain.timestamp && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span>{selectedCard.blockchain.timestamp.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Marks Cards"
      subtitle="View and manage all your academic records"
    >
      <div className="max-w-4xl mx-auto">
        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by semester or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/request-reevaluation">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Request Re-evaluation
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{card.semester}</h3>
                        <Badge variant={statusBadgeVariant[card.status]} className="text-xs">
                          {card.status === 'reevaluated' ? `v${card.version}` : 'Original'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {card.academicYear}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {card.percentage}% • Grade {card.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold">{card.cgpa}</p>
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                    <TransactionBadge status={card.blockchain.status} size="sm" />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(card)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(card)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShowQr(card)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No marks cards found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No marks cards have been issued yet'}
            </p>
          </Card>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate QR Code</DialogTitle>
          </DialogHeader>
          {qrCard && (
            <div className="flex flex-col items-center py-6">
              <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-32 w-32 text-muted-foreground" />
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Scan this QR code to verify the authenticity of this marks card
              </p>
              <div className="text-center">
                <p className="font-semibold">{qrCard.semester}</p>
                <p className="text-sm text-muted-foreground">{qrCard.academicYear}</p>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setShowQrDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
