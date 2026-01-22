import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateMarksCardPDF } from '@/lib/pdfGenerator';
import { GenerationJob } from '@/contexts/GenerationContext';
import { DownloadProgress } from '@/components/generation/DownloadProgressModal';

interface UseJobDownloadReturn {
  isDownloading: boolean;
  downloadProgress: DownloadProgress;
  downloadJob: (job: GenerationJob) => Promise<void>;
  downloadAllJobs: (jobs: GenerationJob[]) => Promise<void>;
}

/**
 * Hook to handle downloading marks card PDFs for generation jobs.
 * Generates PDFs on-the-fly and packages them into a ZIP file.
 */
export function useJobDownload(): UseJobDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ 
    current: 0, 
    total: 0, 
    fileName: '' 
  });

  const downloadJob = useCallback(async (job: GenerationJob) => {
    if (job.status !== 'completed') return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: job.generatedCards, fileName: job.fileName });
    
    try {
      const zip = new JSZip();
      const folderName = job.fileName.replace(/\.[^/.]+$/, '');
      const folder = zip.folder(folderName);

      // Generate PDF marks cards for each student
      for (let i = 1; i <= job.generatedCards; i++) {
        const studentData = {
          id: `MC-${job.id.slice(-6)}-${String(i).padStart(4, '0')}`,
          studentName: `Student ${i}`,
          registrationNo: `REG${new Date().getFullYear()}${String(i).padStart(4, '0')}`,
          rollNo: `R${String(i).padStart(3, '0')}`,
          semester: 'Semester 6',
          academicYear: '2023-2024',
          department: 'Computer Science & Engineering',
          subjects: [
            { code: 'CS601', name: 'Machine Learning', credits: 4, internal: 28, external: 56, total: 84, grade: 'A' },
            { code: 'CS602', name: 'Cloud Computing', credits: 4, internal: 26, external: 52, total: 78, grade: 'B+' },
            { code: 'CS603', name: 'Data Mining', credits: 3, internal: 24, external: 48, total: 72, grade: 'B' },
            { code: 'CS604', name: 'Cyber Security', credits: 3, internal: 27, external: 54, total: 81, grade: 'A' },
          ],
          totalMarks: 315,
          maxMarks: 400,
          percentage: 78.75,
          grade: 'First Class with Distinction',
          blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          issuedAt: job.completedAt || new Date(),
        };

        const pdfDoc = generateMarksCardPDF(studentData);
        const pdfBlob = pdfDoc.output('blob');
        
        folder?.file(
          `${studentData.registrationNo}-${studentData.studentName.replace(/\s+/g, '_')}.pdf`,
          pdfBlob
        );

        // Update progress
        setDownloadProgress(prev => ({ ...prev, current: i }));
        
        // Small delay to allow UI to update and prevent blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Finalize ZIP
      setDownloadProgress(prev => ({ ...prev, current: prev.total }));
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}-marks-cards.zip`);
      
      toast.success(`Downloaded ${job.generatedCards} marks cards as PDF`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate PDF files');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0, fileName: '' });
    }
  }, []);

  const downloadAllJobs = useCallback(async (completedJobs: GenerationJob[]) => {
    if (completedJobs.length === 0) {
      toast.error('No completed jobs to download');
      return;
    }

    setIsDownloading(true);
    const totalGenerated = completedJobs.reduce((sum, j) => sum + j.generatedCards, 0);
    
    try {
      const zip = new JSZip();
      const marksCardsFolder = zip.folder('marks-cards');

      for (const job of completedJobs) {
        const jobFolder = marksCardsFolder?.folder(job.fileName.replace(/\.[^/.]+$/, ''));
        
        // Generate mock marks card data files
        for (let i = 1; i <= job.generatedCards; i++) {
          const cardData = {
            id: `MC-${job.id.slice(-6)}-${String(i).padStart(4, '0')}`,
            studentName: `Student ${i}`,
            registrationNo: `REG${new Date().getFullYear()}${String(i).padStart(4, '0')}`,
            semester: 'Semester 6',
            academicYear: '2023-2024',
            subjects: [
              { code: 'CS601', name: 'Machine Learning', credits: 4, internal: 28, external: 56, total: 84, grade: 'A' },
              { code: 'CS602', name: 'Cloud Computing', credits: 4, internal: 26, external: 52, total: 78, grade: 'B+' },
              { code: 'CS603', name: 'Data Mining', credits: 3, internal: 24, external: 48, total: 72, grade: 'B' },
              { code: 'CS604', name: 'Cyber Security', credits: 3, internal: 27, external: 54, total: 81, grade: 'A' },
            ],
            totalMarks: 315,
            percentage: 78.75,
            grade: 'First Class with Distinction',
            generatedAt: job.completedAt?.toISOString(),
            blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          };

          jobFolder?.file(
            `marks-card-${String(i).padStart(4, '0')}.json`,
            JSON.stringify(cardData, null, 2)
          );
        }

        // Add a summary file for each job
        const summaryData = {
          jobId: job.id,
          fileName: job.fileName,
          totalCards: job.generatedCards,
          generatedAt: job.completedAt?.toISOString(),
          status: job.status,
        };
        jobFolder?.file('_summary.json', JSON.stringify(summaryData, null, 2));
      }

      // Add a manifest file
      const manifest = {
        generatedAt: new Date().toISOString(),
        totalJobs: completedJobs.length,
        totalCards: totalGenerated,
        jobs: completedJobs.map(j => ({
          id: j.id,
          fileName: j.fileName,
          cards: j.generatedCards,
          completedAt: j.completedAt?.toISOString(),
        })),
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Generate and download the ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `marks-cards-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.zip`);
      
      toast.success(`Downloaded ${totalGenerated} marks cards from ${completedJobs.length} jobs`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate ZIP file');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    downloadProgress,
    downloadJob,
    downloadAllJobs,
  };
}
