import { useState } from 'react';
import { toast } from 'react-toastify';
import { targetFileUploadWithProgress } from '../services/requests';
import type { UseTargetFileUploadReturn } from '../utils/interfaces';

export const useTargetFileUpload = (): UseTargetFileUploadReturn => {
  const [isTargetUploaded, setIsTargetUploaded] = useState(false);
  const [targetFields, setTargetFields] = useState<string[]>([]);
  const [targetFileId, setTargetFileId] = useState<number | null>(null);
  const [isTargetUploading, setIsTargetUploading] = useState(false);
  const [targetUploadProgress, setTargetUploadProgress] = useState(0);

  const handleTargetUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsTargetUploading(true);
    setTargetUploadProgress(0);
    
    try {
      const response = await targetFileUploadWithProgress(formData, (progress) => {
        setTargetUploadProgress(progress);
      });
      
      if (response && response.data) {
        console.log('Target file upload response:', response.data);
        
        // Extract headers from response.data.data object
        if (response.data.data && typeof response.data.data === 'object') {
          const headers = Object.keys(response.data.data.data);
          console.log('Extracted headers:', headers);
          setTargetFields(headers);
        }
        
        if (response.data.fileId) {
          setTargetFileId(response.data.fileId);
        }
        
        setIsTargetUploaded(true);
        toast.success('Target file uploaded successfully!');
      }
    } catch (error) {
      console.error('Target file upload error:', error);
      toast.error('Failed to upload target file');
    } finally {
      setIsTargetUploading(false);
      setTimeout(() => setTargetUploadProgress(0), 1000);
    }
  };

  const resetTargetUploadState = () => {
    setIsTargetUploaded(false);
    setTargetFields([]);
    setTargetFileId(null);
    setIsTargetUploading(false);
    setTargetUploadProgress(0);
  };

  return {
    isTargetUploaded,
    targetFields,
    targetFileId,
    isTargetUploading,
    targetUploadProgress,
    handleTargetUpload,
    resetTargetUploadState
  };
}; 