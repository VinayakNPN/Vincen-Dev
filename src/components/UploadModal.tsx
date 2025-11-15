import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      // Simulate upload delay
      setTimeout(() => {
        onUpload(file);
        setSelectedFile(null);
        onClose();
      }, 800);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      // Simulate upload delay
      setTimeout(() => {
        onUpload(file);
        setSelectedFile(null);
        onClose();
      }, 800);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2>Upload Document</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 
              transition-all duration-200 cursor-pointer
              ${isDragging 
                ? "border-[var(--lumen-accent)] bg-[var(--lumen-accent)]/5" 
                : "border-gray-300 hover:border-gray-400"
              }
            `}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-4">
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--lumen-accent)" }}>
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Uploading...</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center space-y-2">
                    <p>Drag & drop your document here</p>
                    <p className="text-sm text-muted-foreground">
                      or <span style={{ color: "var(--lumen-accent)" }}>browse files</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, JPG, PNG
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-muted-foreground">
              🔒 Your privacy matters. All files are processed and immediately deleted from our servers. Only extracted data is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}