import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Button from './Button';
import type { FileDropzoneProps, FileDropzoneRef } from '../utils/interfaces';

const FileDropzone = forwardRef<FileDropzoneRef, FileDropzoneProps>(({
  onFilesSelected,
  accept = '.csv',
  multiple = true,
  className = ''
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useImperativeHandle(ref, () => ({
    clearInput: () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }));

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(newFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onFilesSelected(newFiles);
      // Clear the input after files are selected so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div
      className={`border border-2 border-dashed rounded-3 p-4 text-center ${
        dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
      } ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="mx-auto mb-3 text-primary" size={48} />
      <p className="mb-0 text-muted">
        Drag and drop a CSV file here or{' '}
        <Button
          variant="link"
          className="p-0 text-primary text-decoration-none"
        >
          browse files
        </Button>
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        hidden
      />
    </div>
  );
});

FileDropzone.displayName = 'FileDropzone';

export default FileDropzone; 