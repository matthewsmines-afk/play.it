import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ImportClubsModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      await onImport(file);
      setFile(null);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,short_name,location,founded_year,website,contact_email,contact_phone,address,primary_color,secondary_color,description
Manchester United FC,MUFC,Manchester UK,1878,https://manutd.com,info@manutd.com,+44 161 868 8000,"Sir Matt Busby Way, Old Trafford, Manchester M16 0RA",#DC143C,#FFD700,"One of the most successful football clubs in England"
Arsenal FC,AFC,London UK,1886,https://arsenal.com,info@arsenal.com,+44 20 7619 5003,"Emirates Stadium, Hornsey Rd, London N7 7AJ",#EF0107,#9C824A,"Professional football club based in Islington, London"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'clubs_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Clubs from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-800 mb-2">CSV Format Requirements</h4>
              <p className="text-sm text-slate-600 mb-3">
                Your CSV file should include the following columns (only 'name' is required):
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>• name (required)</div>
                <div>• short_name</div>
                <div>• location</div>
                <div>• founded_year</div>
                <div>• website</div>
                <div>• contact_email</div>
                <div>• contact_phone</div>
                <div>• address</div>
                <div>• primary_color</div>
                <div>• secondary_color</div>
                <div>• description</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <div className="space-y-2">
              <p className="text-slate-600">Drop your CSV file here, or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose CSV File
                </Button>
              </label>
            </div>
            {file && (
              <p className="text-sm text-green-600 mt-3">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {isUploading ? 'Importing...' : 'Import Clubs'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}