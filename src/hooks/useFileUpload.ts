import { useState } from 'react';
import { toast } from 'react-toastify';
import { useFileStore } from '../stores/fileStore';
import type { UseFileUploadReturn } from '../utils/interfaces';

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldTypes, setFieldTypes] = useState<Record<string, string>>({});
  const [fileId, setFileId] = useState<number | null>(null);
  const [downloadFileUrl, setDownloadFileUrl] = useState<string | null>(null);
  const [errorFileUrl, setErrorFileUrl] = useState<string | null>(null);

  const { uploadFile, setMappedFileUrl } = useFileStore();

  const handleUpload = async (files: File[], selectedMapping?: string) => {
    if (files.length === 0) return;

    // Reset mapping state before new upload
    setDownloadFileUrl(null);
    setMappedFileUrl(null);
    setErrorFileUrl(null);

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', file.name.split('.').pop()?.toLowerCase() || 'unknown');
    if (selectedMapping) {
      formData.append('mappingPatternId', selectedMapping);
    }

    const response = await uploadFile(formData);
    if (response && response.data) {
      // Always set file URLs if they exist (for mapping patterns)
      if (response.data.filePath) {
        setDownloadFileUrl(response.data.filePath.mappedUrl);
        setErrorFileUrl(response.data.filePath.errorUrl);
      }
      
      // Handle column errors
      if (response.data.columnsNotFound) {
        toast.error(
          typeof response.data.columnsNotFound === 'string'
            ? response.data.columnsNotFound
            : 'Some columns were not found in the file.'
        );
      }
      
      // Set source fields and other data if available
      if (response.data.data) {
        const dataObj = response.data.data;
        const headers = Object.keys(dataObj);
        setSourceFields(headers);
        setFieldTypes(dataObj);
      }
      
      if (response.data.fileId) {
        setFileId(response.data.fileId);
      }
      
      setIsUploaded(true);
    }
  };

  const resetUploadState = () => {
    setIsUploaded(false);
    setSourceFields([]);
    setFieldTypes({});
    setFileId(null);
    setDownloadFileUrl(null);
    setErrorFileUrl(null);
    setMappedFileUrl(null);
  };

  return {
    isUploaded,
    sourceFields,
    fieldTypes,
    fileId,
    downloadFileUrl,
    errorFileUrl,
    handleUpload,
    resetUploadState
  };
}; 