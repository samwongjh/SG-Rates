/**
 * Utilities for exporting data visualization charts (PNG, SVG) and raw tabular data (CSV, JSON)
 */

export function exportSvgToPng(svgElementId: string, filename: string = 'singapore-market-chart.png') {
  const container = document.getElementById(svgElementId);
  if (!container) {
    console.error(`Element with id ${svgElementId} not found`);
    return;
  }

  const svg = container.querySelector('svg');
  if (!svg) {
    console.error('No SVG found inside element', svgElementId);
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const svgSize = svg.getBoundingClientRect();
  const scale = 2; // High-resolution 2x for sharp print/presentations
  canvas.width = (svgSize.width || 800) * scale;
  canvas.height = (svgSize.height || 400) * scale;

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    // Fill white background for institutional look
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scaled chart
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Add subtle institutional footnote timestamp
    ctx.fillStyle = '#64748b';
    ctx.font = `${10 * scale}px sans-serif`;
    ctx.fillText('Source: Singapore Market Rates Terminal (MAS Benchmark & Interbank Data)', 16 * scale, canvas.height - 12 * scale);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

export function exportSvgToFile(svgElementId: string, filename: string = 'singapore-market-chart.svg') {
  const container = document.getElementById(svgElementId);
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string = 'singapore-rates-data.csv',
  columns?: { key: keyof T; label: string }[]
) {
  if (!data || !data.length) return;

  const headers = columns
    ? columns.map((c) => `"${c.label}"`)
    : Object.keys(data[0]).map((k) => `"${k}"`);

  const keys = columns ? columns.map((c) => c.key) : (Object.keys(data[0]) as (keyof T)[]);

  const rows = data.map((item) =>
    keys
      .map((k) => {
        const val = item[k];
        if (val === undefined || val === null) return '""';
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : `"${val}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

export function exportToJson(data: any, filename: string = 'singapore-rates-data.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
