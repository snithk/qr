
import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFileSelect(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ease-in-out
        border-3 border-dashed rounded-3xl p-12 text-center
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}
        ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-6 rounded-2xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 ${isDragging ? 'scale-110' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-800">Drop your file here</h3>
          <p className="text-slate-500 mt-2">or click to browse from your device</p>
        </div>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['PDF', 'JPG', 'PNG', 'ZIP', 'DOCX'].map(ext => (
            <span key={ext} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              {ext}
            </span>
          ))}
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
            ...and more
          </span>
        </div>
      </div>
    </div>
  );
};
