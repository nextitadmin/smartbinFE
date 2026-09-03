import Papa from 'papaparse';

/**
 * Utility to convert data to CSV and trigger a download in the browser.
 * @param {Array<Object>} data The data rows to export.
 * @param {string} fileName The base name of the exported file.
 */
export const exportToCSV = (data, fileName) => {
    if (!data || data.length === 0) {
        throw new Error("No data available to export.");
    }
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
