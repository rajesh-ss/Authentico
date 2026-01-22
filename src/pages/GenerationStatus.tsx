import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';
import { useJobDownload } from '@/hooks';
import { historicalBatches } from '@/data';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobCard, DownloadProgressModal } from '@/components/generation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { isAfter, subDays, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface JobGroup {
  parentFile: string;
  jobs: GenerationJob[];
  totalCards: number;
  completedCards: number;
  allCompleted: boolean;
  hasActive: boolean;
  hasFailed: boolean;
  latestDate: number;
  successfulBatches: number;
  failedBatches: number;
}

export default function GenerationStatus() {
  const { jobs, isGenerating, activeJob, retryJob } = useGeneration();
  const { isDownloading, downloadProgress, downloadJob } = useJobDownload();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [parentFileFilter, setParentFileFilter] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Combine current session jobs with historical batches
  const allJobs = useMemo(() => 
    [...jobs, ...historicalBatches.filter(h => !jobs.some(j => j.id === h.id))],
    [jobs]
  );

  // Get unique parent file names for filter dropdown
  const parentFileNames = useMemo(() => {
    const names = new Set<string>();
    allJobs.forEach(job => {
      if (job.parentFileName) names.add(job.parentFileName);
    });
    return Array.from(names).sort();
  }, [allJobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesParentFile = parentFileFilter === 'all' || job.parentFileName === parentFileFilter;

      let matchesDate = true;
      const jobDate = job.completedAt || job.startedAt;
      const now = new Date();
      
      switch (dateFilter) {
        case 'today': matchesDate = isAfter(jobDate, subDays(now, 1)); break;
        case 'week': matchesDate = isAfter(jobDate, subDays(now, 7)); break;
        case 'month': matchesDate = isAfter(jobDate, subMonths(now, 1)); break;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesParentFile;
    });
  }, [allJobs, searchQuery, statusFilter, dateFilter, parentFileFilter]);

// Group jobs by parent file name
  const groupedJobs = useMemo((): JobGroup[] => {
    const groups = new Map<string, GenerationJob[]>();
    
    filteredJobs.forEach(job => {
      const key = job.parentFileName || job.fileName;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(job);
    });
    
    groups.forEach((jobList) => {
      jobList.sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));
    });
    
    return Array.from(groups.entries())
      .map(([parentFile, jobList]) => {
        const successfulBatches = jobList.filter(j => j.status === 'completed').length;
        const failedBatches = jobList.filter(j => j.status === 'failed').length;
        return {
          parentFile,
          jobs: jobList,
          totalCards: jobList.reduce((sum, j) => sum + j.totalCards, 0),
          completedCards: jobList.reduce((sum, j) => sum + j.generatedCards, 0),
          allCompleted: jobList.every(j => j.status === 'completed'),
          hasActive: jobList.some(j => j.status === 'in_progress'),
          hasFailed: jobList.some(j => j.status === 'failed'),
          latestDate: Math.max(...jobList.map(j => (j.completedAt || j.startedAt).getTime())),
          successfulBatches,
          failedBatches,
        };
      })
      .sort((a, b) => b.latestDate - a.latestDate);
  }, [filteredJobs]);


  const completedJobs = filteredJobs.filter(j => j.status === 'completed');
  const failedJobs = filteredJobs.filter(j => j.status === 'failed');
  const totalGenerated = completedJobs.reduce((sum, j) => sum + j.generatedCards, 0);
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || dateFilter !== 'all' || parentFileFilter !== 'all';

  const toggleGroup = (parentFile: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(parentFile) ? next.delete(parentFile) : next.add(parentFile);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setParentFileFilter('all');
  };

  const handleViewDetails = (jobId: string) => navigate(`/batch/${jobId}`);

  return (
    <DashboardLayout
      title="Marks Cards"
      subtitle="Track the progress of marks card generation jobs"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard 
            icon={isGenerating ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <RefreshCw className="h-5 w-5 text-primary" />}
            value={isGenerating ? 1 : 0}
            label="Active Jobs"
            bgClass="bg-primary/10"
          />
          <StatCard 
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            value={completedJobs.length}
            label="Completed"
            bgClass="bg-success/10"
          />
          <StatCard 
            icon={<XCircle className="h-5 w-5 text-destructive" />}
            value={failedJobs.length}
            label="Failed"
            bgClass="bg-destructive/10"
          />
          <StatCard 
            icon={<Layers className="h-5 w-5 text-muted-foreground" />}
            value={totalGenerated}
            label="Total Cards"
            bgClass="bg-muted"
          />
        </div>

        {/* Active Job */}
        {activeJob && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <CardTitle className="text-lg">Currently Generating</CardTitle>
              </div>
              <CardDescription>Marks cards are being generated in the background</CardDescription>
            </CardHeader>
            <CardContent>
              <JobCard job={activeJob} />
            </CardContent>
          </Card>
        )}

        {/* Job History */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Generation History</CardTitle>
                <CardDescription>
                  {hasActiveFilters 
                    ? `Showing ${filteredJobs.length} of ${allJobs.length} batches`
                    : 'All marks card generation jobs'
                  }
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/issue/template')} className="gap-2">
                New Generation <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <Filter className="h-4 w-4 mr-2 hidden sm:block" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
                {parentFileNames.length > 0 && (
                  <Select value={parentFileFilter} onValueChange={setParentFileFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] col-span-2 sm:col-span-1">
                      <FolderOpen className="h-4 w-4 mr-2 hidden sm:block" />
                      <SelectValue placeholder="Source File" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Uploads</SelectItem>
                      {parentFileNames.map(name => (
                        <SelectItem key={name} value={name}>
                          {name.length > 20 ? `${name.slice(0, 20)}...` : name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0 col-span-2 sm:col-span-1 justify-self-end sm:justify-self-auto">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredJobs.length === 0 ? (
              <EmptyState 
                hasFilters={hasActiveFilters} 
                onClearFilters={clearFilters}
                onNavigate={() => navigate('/issue/template')}
              />
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {groupedJobs.map((group) => (
                    <JobGroupCard
                      key={group.parentFile}
                      group={group}
                      isExpanded={expandedGroups.has(group.parentFile)}
                      activeJobId={activeJob?.id}
                      onToggle={() => toggleGroup(group.parentFile)}
                      onRetry={retryJob}
                      onDownload={downloadJob}
                      onViewDetails={handleViewDetails}
                      isDownloading={isDownloading}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <DownloadProgressModal progress={downloadProgress} isVisible={isDownloading} />
      </div>
    </DashboardLayout>
  );
}

// --- Sub-components ---

function StatCard({ icon, value, label, bgClass }: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  bgClass: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", bgClass)}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasFilters, onClearFilters, onNavigate }: { 
  hasFilters: boolean;
  onClearFilters: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-medium text-lg mb-1">No matching batches</h3>
          <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" /> Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-medium text-lg mb-1">No generation jobs yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Upload student data to start generating marks cards</p>
          <Button onClick={onNavigate} className="gap-2">
            Issue Marks Cards <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function JobGroupCard({ 
  group, 
  isExpanded, 
  activeJobId,
  onToggle, 
  onRetry, 
  onDownload, 
  onViewDetails,
  isDownloading
}: {
  group: JobGroup;
  isExpanded: boolean;
  activeJobId?: string;
  onToggle: () => void;
  onRetry: (id: string) => void;
  onDownload: (job: GenerationJob) => void;
  onViewDetails: (id: string) => void;
  isDownloading: boolean;
}) {
  const allJobs = group.jobs;

  if (allJobs.length === 0) return null;

  // For single batch uploads, show directly without grouping
  if (allJobs.length === 1) {
    const job = allJobs[0];
    if (job.id === activeJobId) return null;
    return (
      <JobCard 
        job={job} 
        onRetry={onRetry} 
        onDownload={onDownload} 
        onViewDetails={onViewDetails} 
        isDownloading={isDownloading} 
      />
    );
  }

  const displaySuccessCount = group.successfulBatches;
  const displayFailedCount = group.failedBatches;
  const displayActiveCount = allJobs.filter(j => j.status === 'in_progress').length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn(
        "transition-all",
        group.hasActive && "border-primary/50",
        group.hasFailed && !group.hasActive && "border-destructive/30"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{group.parentFile}</p>
                  <p className="text-sm text-muted-foreground">
                    {allJobs.length} batches • {group.totalCards.toLocaleString()} records
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {displayActiveCount > 0 && (
                  <Badge variant="default" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> {displayActiveCount} Generating
                  </Badge>
                )}
                {displaySuccessCount > 0 && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {displaySuccessCount} Successful
                  </Badge>
                )}
                {displayFailedCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" /> {displayFailedCount} Failed
                  </Badge>
                )}
              </div>
            </div>
            
            {(displayActiveCount > 0 || displayFailedCount > 0) && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Overall Progress</span>
                  <span>
                    {group.completedCards.toLocaleString()} / {group.totalCards.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(group.completedCards / group.totalCards) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 border-t">
              {allJobs
                .filter(j => j.id !== activeJobId)
                .map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onRetry={onRetry} 
                    onDownload={onDownload} 
                    onViewDetails={onViewDetails} 
                    isDownloading={isDownloading} 
                  />
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
