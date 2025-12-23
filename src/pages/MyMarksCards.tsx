import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { StatusBadge, FormDialog } from '@/components/shared';
import { mockMarksCards, type MarksCard } from '@/data';
import { useDialog } from '@/hooks/useDialog';
import { 
  FileText, Download, Eye, QrCode, Search, ArrowLeft,
  RefreshCcw, Calendar, Award, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyMarksCards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<MarksCard | null>(null);
  const qrDialog = useDialog<MarksCard>();

  const filteredCards = mockMarksCards.filter(card => 
    card.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.academicYear.includes(searchQuery)
  );

  const handleDownload = (card: MarksCard) => {
    console.log('Downloading:', card.id);
  };

  // Detail View
  if (selectedCard) {
    return (
      <DashboardLayout title={selectedCard.semester} subtitle={`Academic Year ${selectedCard.academicYear}`}>
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setSelectedCard(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to All Cards
          </Button>

          <Card className="mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-bold">{selectedCard.semester}</h2>
                      <StatusBadge status={selectedCard.status} label={selectedCard.status === 'reevaluated' ? `v${selectedCard.version}` : 'Original'} />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedCard.academicYear} • Issued {selectedCard.issuedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedCard)}><Download className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Download</span></Button>
                  <Button variant="outline" size="sm" onClick={() => qrDialog.open(selectedCard)}><QrCode className="h-4 w-4 mr-2" /><span className="hidden sm:inline">QR Code</span></Button>
                  <Button variant="outline" size="sm" asChild><Link to="/request-reevaluation"><RefreshCcw className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Re-evaluation</span></Link></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Total Marks', value: `${selectedCard.totalMarks}/${selectedCard.maxMarks}` },
                  { label: 'Percentage', value: `${selectedCard.percentage}%` },
                  { label: 'Grade', value: selectedCard.grade },
                  { label: 'CGPA', value: selectedCard.cgpa },
                ].map((stat, i) => (
                  <div key={i} className="p-3 md:p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">Subject-wise Marks</CardTitle></CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Code', 'Subject', 'Int', 'Ext', 'Total', 'Grade', 'Cr'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCard.subjects.map((subject) => (
                      <tr key={subject.code} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs md:text-sm">{subject.code}</td>
                        <td className="py-3 px-4 text-sm">{subject.name}</td>
                        <td className="py-3 px-4 text-center text-sm">{subject.internalMarks}</td>
                        <td className="py-3 px-4 text-center text-sm">{subject.externalMarks}</td>
                        <td className="py-3 px-4 text-center font-medium text-sm">{subject.totalMarks}/{subject.maxMarks}</td>
                        <td className="py-3 px-4 text-center"><Badge variant="outline" className="text-xs">{subject.grade}</Badge></td>
                        <td className="py-3 px-4 text-center text-sm">{subject.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" />Blockchain Verification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><span className="text-muted-foreground">Status</span><TransactionBadge status={selectedCard.blockchain.status} /></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><span className="text-muted-foreground">Transaction Hash</span><TransactionHash hash={selectedCard.blockchain.hash} /></div>
              {selectedCard.blockchain.blockNumber && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><span className="text-muted-foreground">Block Number</span><span className="font-mono">#{selectedCard.blockchain.blockNumber}</span></div>}
              {selectedCard.blockchain.timestamp && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><span className="text-muted-foreground">Timestamp</span><span className="text-sm">{selectedCard.blockchain.timestamp.toLocaleString()}</span></div>}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // List View
  return (
    <DashboardLayout title="My Marks Cards" subtitle="View and manage all your academic records">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by semester or year..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1 sm:flex-none"><Link to="/request-reevaluation"><RefreshCcw className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Request</span> Re-eval</Link></Button>
            <Button variant="outline" className="flex-1 sm:flex-none"><Download className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Download</span> All</Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base md:text-lg">{card.semester}</h3>
                        <StatusBadge status={card.status} label={card.status === 'reevaluated' ? `v${card.version}` : 'Original'} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{card.academicYear}</span>
                        <span className="flex items-center gap-1"><Award className="h-3 w-3" />{card.percentage}% • Grade {card.grade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <div className="text-left md:text-right mr-2 md:mr-4">
                      <p className="text-xl md:text-2xl font-bold">{card.cgpa}</p>
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                    <div className="hidden sm:block"><TransactionBadge status={card.blockchain.status} size="sm" /></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCard(card)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(card)}><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => qrDialog.open(card)}><QrCode className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <FormDialog open={qrDialog.isOpen} onOpenChange={(open) => !open && qrDialog.close()} title="Certificate QR Code" onSubmit={qrDialog.close} submitLabel="Close" maxWidth="sm">
          {qrDialog.data && (
            <div className="flex flex-col items-center py-6">
              <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center mb-4"><QrCode className="h-32 w-32 text-muted-foreground" /></div>
              <p className="text-sm text-muted-foreground text-center">Scan to verify {qrDialog.data.semester} marks card</p>
              <p className="text-xs text-muted-foreground mt-2 font-mono break-all text-center px-4">{qrDialog.data.blockchain.hash.slice(0, 20)}...</p>
            </div>
          )}
        </FormDialog>
      </div>
    </DashboardLayout>
  );
}
