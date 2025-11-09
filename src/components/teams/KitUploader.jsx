
import React, { useState, useRef } from 'react';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Added missing import for Label
import { UploadCloud, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KitUploader({ label, currentUrl, onUpload }) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { file_url } = await UploadFile({ file });
      onUpload(file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onUpload(''); // Pass empty string to clear the URL
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 bg-slate-50 relative">
        {isLoading ? (
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        ) : currentUrl ? (
          <>
            <img src={currentUrl} alt={`${label} preview`} className="max-w-full max-h-full object-contain rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="text-center space-y-2">
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500">No image uploaded</p>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isLoading}
      />
    </div>
  );
}
