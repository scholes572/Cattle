import { useState } from "react";
import { Download, Upload, Database, FileJson, FileSpreadsheet, Archive, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { API_URL } from "../api";

export function DataPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const exportCattleJson = async () => {
    setExporting('cattle-json');
    try {
      const response = await fetch(`${API_URL}/export/cattle/json`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cattle-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Cattle data exported as JSON successfully');
      } else {
        showMessage('error', 'Failed to export cattle data');
      }
    } catch (error) {
      showMessage('error', 'Error exporting cattle data');
    }
    setExporting(null);
  };

  const exportCattleCsv = async () => {
    setExporting('cattle-csv');
    try {
      const response = await fetch(`${API_URL}/export/cattle/csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cattle-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Cattle data exported as CSV successfully');
      } else {
        showMessage('error', 'Failed to export cattle data');
      }
    } catch (error) {
      showMessage('error', 'Error exporting cattle data');
    }
    setExporting(null);
  };

  const exportMilkJson = async () => {
    setExporting('milk-json');
    try {
      const response = await fetch(`${API_URL}/export/milk/json`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `milk-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Milk production data exported as JSON successfully');
      } else {
        showMessage('error', 'Failed to export milk data');
      }
    } catch (error) {
      showMessage('error', 'Error exporting milk data');
    }
    setExporting(null);
  };

  const exportMilkCsv = async () => {
    setExporting('milk-csv');
    try {
      const response = await fetch(`${API_URL}/export/milk/csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `milk-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Milk production data exported as CSV successfully');
      } else {
        showMessage('error', 'Failed to export milk data');
      }
    } catch (error) {
      showMessage('error', 'Error exporting milk data');
    }
    setExporting(null);
  };

  const downloadBackup = async () => {
    setExporting('backup');
    try {
      const response = await fetch(`${API_URL}/backup`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cattle-info-backup-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Full backup downloaded successfully (includes all data and images)');
      } else {
        showMessage('error', 'Failed to download backup');
      }
    } catch (error) {
      showMessage('error', 'Error downloading backup');
    }
    setExporting(null);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showMessage('success', result.message);
        // Refresh the page after successful import
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showMessage('error', result.error || 'Failed to import data');
      }
    } catch (error) {
      showMessage('error', 'Error importing data');
    }
    setImporting(false);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
      <p className="text-gray-600 mb-8">Export, backup, and restore your cattle management data</p>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Cattle Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-green-600" />
              Export Cattle Data
            </CardTitle>
            <CardDescription>Download your cattle records</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={exportCattleJson}
              disabled={exporting === 'cattle-json' || exporting === 'backup'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting === 'cattle-json' ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button
              onClick={exportCattleCsv}
              disabled={exporting === 'cattle-csv' || exporting === 'backup'}
              variant="outline"
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting === 'cattle-csv' ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Milk Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Export Milk Data
            </CardTitle>
            <CardDescription>Download your milk production records</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={exportMilkJson}
              disabled={exporting === 'milk-json' || exporting === 'backup'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting === 'milk-json' ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button
              onClick={exportMilkCsv}
              disabled={exporting === 'milk-csv' || exporting === 'backup'}
              variant="outline"
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting === 'milk-csv' ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Full Backup */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-purple-600" />
              Full Backup
            </CardTitle>
            <CardDescription>
              Download a complete backup of all your data including cattle records, milk production data, and images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={downloadBackup}
              disabled={exporting === 'backup' || importing}
              className="w-full"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {exporting === 'backup' ? 'Creating Backup...' : 'Download Complete Backup (ZIP)'}
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-600" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a backup file (JSON or ZIP format). This will replace existing data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Importing will replace all existing data. Make sure to create a backup first.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-4">
              <label htmlFor="import-file" className="cursor-pointer">
                <Button
                  disabled={importing || exporting === 'backup'}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {importing ? 'Importing...' : 'Select Backup File'}
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.zip"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing || exporting === 'backup'}
                />
              </label>
              <span className="text-sm text-gray-500">
                Supported formats: JSON (.json), ZIP archives (.zip)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
