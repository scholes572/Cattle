import { useState } from "react";
import { Download, Upload, Database, FileJson, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { cattleApi, milkApi } from "../api";

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
      const response = await cattleApi.getAll();
      if (response.success) {
        const blob = new Blob([JSON.stringify(response.cattle, null, 2)], { type: 'application/json' });
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
      const response = await cattleApi.getAll();
      if (response.success && response.cattle) {
        // Convert to CSV
        const cattle = response.cattle as any[];
        if (cattle.length === 0) {
          showMessage('error', 'No cattle data to export');
          setExporting(null);
          return;
        }
        
        const headers = ['id', 'tagNumber', 'name', 'breed', 'gender', 'dateOfBirth', 'weight', 'color', 'status', 'notes'];
        const csvContent = [
          headers.join(','),
          ...cattle.map(c => headers.map(h => {
            const val = c[h] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
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
      const response = await milkApi.getAll();
      if (response.success) {
        const blob = new Blob([JSON.stringify(response.records, null, 2)], { type: 'application/json' });
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
      const response = await milkApi.getAll();
      if (response.success && response.records) {
        const records = response.records as any[];
        if (records.length === 0) {
          showMessage('error', 'No milk data to export');
          setExporting(null);
          return;
        }
        
        const headers = ['id', 'cattleId', 'cattleName', 'cattleTagNumber', 'date', 'morningLiters', 'eveningLiters', 'totalLiters', 'notes'];
        const csvContent = [
          headers.join(','),
          ...records.map(r => headers.map(h => {
            const val = r[h] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        // Determine if it's cattle or milk data based on fields
        if (data.length > 0 && data[0].tagNumber) {
          // Cattle data - import each item
          for (const item of data) {
            await cattleApi.create(item);
          }
          showMessage('success', `Imported ${data.length} cattle records`);
        } else if (data.length > 0 && data[0].cattleId) {
          // Milk data - import each item (would need to adapt for Supabase)
          showMessage('error', 'Milk import not yet supported - please add records manually');
        } else {
          showMessage('error', 'Unknown data format');
        }
      } else {
        showMessage('error', 'Invalid file format');
      }
    } catch (error) {
      showMessage('error', 'Error importing data: ' + (error as Error).message);
    }
    
    setImporting(false);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
      <p className="text-gray-600 mb-8">Export and backup your cattle management data</p>

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
              disabled={exporting === 'cattle-json'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting === 'cattle-json' ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button
              onClick={exportCattleCsv}
              disabled={exporting === 'cattle-csv'}
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
              disabled={exporting === 'milk-json'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting === 'milk-json' ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button
              onClick={exportMilkCsv}
              disabled={exporting === 'milk-csv'}
              variant="outline"
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting === 'milk-csv' ? 'Exporting...' : 'Export as CSV'}
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
              Import cattle data from a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Importing will add new records. Make sure to export your current data first.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-4">
              <label htmlFor="import-file" className="cursor-pointer">
                <Button
                  disabled={importing}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {importing ? 'Importing...' : 'Select JSON File'}
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
              <span className="text-sm text-gray-500">
                Supported format: JSON (.json)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
