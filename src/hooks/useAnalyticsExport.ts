import { useCallback } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from '@e965/xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

export function useAnalyticsExport() {
  const { toast } = useToast();

  const exportToCSV = useCallback((data: object[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
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
      body: data.map((row) => 
        columns.map((col) => 
          (row as Record<string, unknown>)[col.toLowerCase().replace(/ /g, '')] ?? ''
        )
      ),
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
    toast({ title: 'Export Successful', description: `${title}.pdf has been downloaded` });
  }, [toast]);

  return { exportToCSV, exportToPDF };
}
