import {File, FileImage, FileSpreadsheet, FileText, Presentation,} from 'lucide-react';

export function getFileIcon(contentType: string) {
    if (contentType.includes('pdf')) return FileText;
    if (contentType.includes('image')) return FileImage;
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return FileSpreadsheet;
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return Presentation;
    if (contentType.includes('word') || contentType.includes('document')) return FileText;
    return File;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
