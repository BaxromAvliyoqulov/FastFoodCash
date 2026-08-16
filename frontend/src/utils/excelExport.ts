/**
 * Excel (.xlsx / .csv UTF-8 with BOM) Export Helper
 * O'zbekiston kassa va buxgalteriya hisoboti uchun toza Excel fayl yaratuvchi utilita.
 */

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  // UTF-8 BOM so Microsoft Excel in Windows displays characters properly
  const BOM = '\uFEFF';
  
  const csvContent = [
    headers.map(h => `"${(h || '').toString().replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(cell => `"${(cell !== undefined && cell !== null ? cell : '').toString().replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
