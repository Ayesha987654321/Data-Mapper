import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getFileById } from '../services/requests';
import type { UseEditModeReturn } from '../utils/interfaces';

export const useEditMode = (): UseEditModeReturn => {
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldTypes, setFieldTypes] = useState<Record<string, string>>({});
  const [fileId, setFileId] = useState<number | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetchedFileIdRef = useRef<number | null>(null);

  const fetchFileData = (fileId: number) => {
    console.log('Fetching file data for fileId:', fileId);
    setIsEditLoading(true);
    getFileById(fileId).then(res => {
      console.log('File data response:', res.data);
      if (res.data && res.data.data) {
        const dataObj = res.data.data.data;
        const headers = Object.keys(dataObj);
        console.log('Extracted headers:', headers);
        setSourceFields(headers);
        setFieldTypes(dataObj);
        setFileId(res.data.data.fileId);
        setIsUploaded(true);
      }
      setIsEditLoading(false);
    }).catch((error) => {
      console.error('Error fetching file data:', error);
      setIsEditLoading(false);
    });
  };

  const clearEditMode = () => {
    setSearchParams({});
    fetchedFileIdRef.current = null;
  };

  const resetEditModeState = () => {
    // Reset all edit mode state - only used when selecting new files
    setSourceFields([]);
    setFieldTypes({});
    setFileId(null);
    setIsUploaded(false);
  };

  // Edit mode: if fileId is passed in location.state, fetch file data
  useEffect(() => {
    // Check if we have fileId from location.state (new navigation) or URL params (refresh)
    const fileIdFromState = location.state?.fileId;
    const fileIdFromParams = searchParams.get('fileId');
    
    console.log('useEditMode useEffect triggered:', { fileIdFromState, fileIdFromParams });
    
    const targetFileId = fileIdFromState || (fileIdFromParams ? parseInt(fileIdFromParams) : null);
    
    console.log('Target fileId:', targetFileId, 'Current fetchedFileId:', fetchedFileIdRef.current);
    
    // Prevent duplicate calls
    if (targetFileId && fetchedFileIdRef.current !== targetFileId) {
      console.log('Fetching file data for new fileId:', targetFileId);
      fetchedFileIdRef.current = targetFileId;
      
      if (fileIdFromState) {
        // New navigation from file history - add to URL params
        setSearchParams({ fileId: fileIdFromState.toString() });
      }
      
      fetchFileData(targetFileId);
    }
  }, [location.state?.fileId, searchParams.get('fileId')]);

  return {
    isEditLoading,
    sourceFields,
    fieldTypes,
    fileId,
    isUploaded,
    clearEditMode,
    resetEditModeState
  };
}; 