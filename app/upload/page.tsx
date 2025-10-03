'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadApi, indentsApi } from '@/lib/api';
import { 
  Upload,
  FileImage,
  X,
  Check,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const { user, hasRole } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIndent, setSelectedIndent] = useState<string>('');
  const [indents, setIndents] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load indents for this engineer
  useState(() => {
    const loadIndents = async () => {
      try {
        const response = await indentsApi.getIndents({
          siteId: user?.siteId,
          status: 'RECEIVED'
        });
        setIndents(response.indents || []);
      } catch (error) {
        console.error('Failed to load indents:', error);
      }
    };

    if (user && hasRole('SITE_ENGINEER')) {
      loadIndents();
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadedUrl(''); // Clear previous upload
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedIndent) {
      toast.error('Please select both a file and an indent');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadReceipt(selectedFile, selectedIndent);
      setUploadedUrl(result.url);
      toast.success('Receipt uploaded successfully!');

      // Clear form
      setSelectedFile(null);
      setSelectedIndent('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!hasRole('SITE_ENGINEER')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4 text-center">
          <p className="text-gray-600">Upload feature is only available for Site Engineers.</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mobile-safe-area p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Receipt</h1>
          <p className="text-gray-600">
            Upload receipt photos for received materials
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="h-5 w-5" />
              <span>Receipt Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Indent Selection */}
            <div className="space-y-2">
              <Label>Select Indent</Label>
              <Select value={selectedIndent} onValueChange={setSelectedIndent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an indent" />
                </SelectTrigger>
                <SelectContent>
                  {indents.map(indent => (
                    <SelectItem key={indent.id} value={indent.id}>
                      Indent #{indent.id.slice(-6)} - {indent.siteName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <Label>Receipt Image</Label>

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Tap to select or take a photo
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, or HEIC up to 10MB
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileImage className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Preview */}
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Receipt preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedIndent || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Receipt</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Success Message */}
        {uploadedUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">
                      Receipt Uploaded Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      Your receipt has been saved and linked to the indent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Ensure good lighting for clear photos</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Include all receipt details like date and amounts</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Keep receipts flat to avoid shadows</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Maximum file size: 10MB</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
