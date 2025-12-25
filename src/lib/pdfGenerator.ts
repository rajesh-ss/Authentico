import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentData {
  id: string;
  studentName: string;
  registrationNo: string;
  rollNo: string;
  semester: string;
  academicYear: string;
  department: string;
  subjects: Array<{
    code: string;
    name: string;
    credits: number;
    internal: number;
    external: number;
    total: number;
    grade: string;
  }>;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  blockchainHash: string;
  issuedAt: Date;
}

export function generateMarksCardPDF(student: StudentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('University of Technology', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Statement of Marks', pageWidth / 2, 25, { align: 'center' });
  
  // Blockchain verified badge
  doc.setFillColor(34, 197, 94); // Green
  doc.roundedRect(pageWidth / 2 - 30, 28, 60, 6, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text('✓ Blockchain Verified', pageWidth / 2, 32, { align: 'center' });
  
  // Student Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 50);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 53, pageWidth - 14, 53);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const infoY = 60;
  const col1X = 14;
  const col2X = pageWidth / 2 + 10;
  
  // Left column
  doc.setTextColor(100, 100, 100);
  doc.text('Student Name:', col1X, infoY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(student.studentName, col1X + 35, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Registration No:', col1X, infoY + 8);
  doc.setTextColor(0, 0, 0);
  doc.text(student.registrationNo, col1X + 35, infoY + 8);
  
  doc.setTextColor(100, 100, 100);
  doc.text('Roll No:', col1X, infoY + 16);
  doc.setTextColor(0, 0, 0);
  doc.text(student.rollNo, col1X + 35, infoY + 16);
  
  // Right column
  doc.setTextColor(100, 100, 100);
  doc.text('Semester:', col2X, infoY);
  doc.setTextColor(0, 0, 0);
  doc.text(student.semester, col2X + 30, infoY);
  
  doc.setTextColor(100, 100, 100);
  doc.text('Academic Year:', col2X, infoY + 8);
  doc.setTextColor(0, 0, 0);
  doc.text(student.academicYear, col2X + 30, infoY + 8);
  
  doc.setTextColor(100, 100, 100);
  doc.text('Department:', col2X, infoY + 16);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(student.department, col2X + 30, infoY + 16);
  
  // Subject-wise Marks Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject-wise Marks', 14, 95);
  
  const tableData = student.subjects.map(sub => [
    sub.code,
    sub.name,
    sub.credits.toString(),
    sub.internal.toString(),
    sub.external.toString(),
    sub.total.toString(),
    sub.grade
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Code', 'Subject Name', 'Credits', 'Internal', 'External', 'Total', 'Grade']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Results Summary Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, finalY, pageWidth - 28, 40, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Results Summary', 20, finalY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Summary details
  doc.setTextColor(100, 100, 100);
  doc.text('Total Marks:', 20, finalY + 20);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.totalMarks} / ${student.maxMarks}`, 55, finalY + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Percentage:', 20, finalY + 28);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.percentage}%`, 55, finalY + 28);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Result:', 20, finalY + 36);
  
  // Result badge
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(55, finalY + 31, 55, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(student.grade, 82, finalY + 36, { align: 'center' });
  
  // QR Code placeholder and blockchain info
  const blockchainY = finalY + 55;
  
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, blockchainY, pageWidth - 28, 35, 3, 3, 'F');
  
  // QR placeholder
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(255, 255, 255);
  doc.rect(20, blockchainY + 5, 25, 25, 'FD');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('QR Code', 32.5, blockchainY + 18, { align: 'center' });
  
  // Blockchain details
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Blockchain Verification', 52, blockchainY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Transaction Hash:', 52, blockchainY + 18);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  doc.text(student.blockchainHash, 52, blockchainY + 24);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Issued: ${student.issuedAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 52, blockchainY + 32);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Document ID: ${student.id}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc;
}

export function downloadSinglePDF(student: StudentData) {
  const doc = generateMarksCardPDF(student);
  doc.save(`marks-card-${student.registrationNo}.pdf`);
}

export async function downloadBulkPDF(students: StudentData[], batchName: string): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const { saveAs } = await import('file-saver');
  
  const zip = new JSZip();
  const folder = zip.folder(batchName);
  
  for (const student of students) {
    const doc = generateMarksCardPDF(student);
    const pdfBlob = doc.output('blob');
    folder?.file(`${student.registrationNo}-${student.studentName.replace(/\s+/g, '_')}.pdf`, pdfBlob);
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${batchName}-marks-cards.zip`);
}
