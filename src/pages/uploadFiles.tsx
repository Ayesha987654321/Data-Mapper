import React, { useRef, useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import DatabaseMapper from '../components/DatabaseMapper';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useFileStore } from '../stores/fileStore';
import Button from '../components/Button';
import FileDropzone from '../components/FileDropzone';
import type { FileDropzoneRef } from '../utils/interfaces';
import FileList from '../components/FileList';
import ProgressButton from '../components/ProgressButton';
import SuccessAlert from '../components/SuccessAlert';
import LoadingProgress from '../components/LoadingProgress';
import MappingSelect from '../components/MappingSelect';
import MappingEditModal from '../components/MappingEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useFileUpload } from '../hooks/useFileUpload';
import { useEditMode } from '../hooks/useEditMode';
import { updateUserMapping } from '../services/requests';
import { toast } from 'react-toastify';

const UploadFiles: React.FC<any> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [forceExpandMapper, setForceExpandMapper] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);
  const [isUpdatingMapping, setIsUpdatingMapping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMapping, setDeletingMapping] = useState<any>(null);
  
  const fileDropzoneRef = useRef<FileDropzoneRef>(null);

  const {
    isUploading,
    uploadProgress,
    allPatterns,
    fetchAllPatterns,
    clearFileUrls,
  } = useFileStore();

  // Custom hooks
  const {
    isUploaded,
    sourceFields,
    fieldTypes,
    fileId,
    downloadFileUrl,
    errorFileUrl,
    handleUpload,
    resetUploadState
  } = useFileUpload();

  const {
    isEditLoading,
    sourceFields: editSourceFields,
    fieldTypes: editFieldTypes,
    fileId: editFileId,
    isUploaded: isEditUploaded,
    clearEditMode,
    resetEditModeState
  } = useEditMode();

  // Use edit mode data if available, otherwise use upload data
  const finalSourceFields = editSourceFields.length > 0 ? editSourceFields : sourceFields;
  const finalFieldTypes = Object.keys(editFieldTypes).length > 0 ? editFieldTypes : fieldTypes;
  const finalFileId = editFileId || fileId;
  const finalIsUploaded = isEditUploaded || isUploaded;





  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');
  
      if (!isCSV) {
        toast.error('Only CSV files are allowed');
        return;
      }
  
      setFiles([selectedFile]);
      // Reset upload state when a new file is selected
      resetUploadState();
      resetEditModeState();
      clearFileUrls(); // Clear any existing mapped file URLs
    }
  };

  const handleUploadClick = async () => {
    setForceExpandMapper(f => f + 1); // force expand DatabaseMapper
    await handleUpload(files, selectedMapping);
  };

  const handleRemoveFile = () => {
    setFiles([]); // Clear all files since we only handle one
    resetUploadState();
    fileDropzoneRef.current?.clearInput();
  };

  // Prepare react-select options with mapping object
  const mappingOptions = allPatterns.map((pattern: any) => ({
    value: pattern.id,
    label: pattern.name,
    mapping: pattern
  }));

  const handleEditMapping = (mapping: any) => {
    setEditingMapping(mapping);
    setShowEditModal(true);
  };

  const handleSaveMapping = async (payload: { id: string; name: string; pattern: Record<string, { columns: string[]; type: string }> }) => {
    setIsUpdatingMapping(true);
    try {
      await updateUserMapping(payload);
      toast.success('Mapping updated successfully!');
      await fetchAllPatterns(); // Refresh patterns
      setShowEditModal(false);
      setEditingMapping(null);
    } catch (error: any) {
      // Error handling is done in the modal
    } finally {
      setIsUpdatingMapping(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMapping(null);
  };

  const handleDeleteMappingClick = (mapping: any) => {
    setDeletingMapping(mapping);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingMapping(null);
  };

  const handleDeleteSuccess = async () => {
    await fetchAllPatterns(); // Refresh patterns
  };

  // Clear edit mode when file is successfully uploaded
  useEffect(() => {
    if (finalIsUploaded && !isEditLoading) {
      clearEditMode();
    }
  }, [finalIsUploaded, isEditLoading]);





  // Determine if upload button should be shown
  const shouldShowUploadButton = () => {
    return files.length > 0;
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            {/* File Upload Section */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h2 className="card-title text-center mb-0 fw-bold flex-grow-1">Upload Files</h2>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsCollapsed(c => !c)}
                  tabIndex={-1}
                  title={isCollapsed ? 'Expand' : 'Collapse'}
                  className="ms-2"
                  style={{ textDecoration: 'none' }}
                >
                  {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </Button>
              </div>
              {!isCollapsed && (
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-medium">Select File Mapping</label>
                    <MappingSelect
                      value={mappingOptions.find(opt => opt.value === selectedMapping) || null}
                      onChange={option => setSelectedMapping(option ? option.value : '')}
                      options={mappingOptions}
                      onEditMapping={handleEditMapping}
                      onDeleteMapping={handleDeleteMappingClick}
                      placeholder="Choose a mapping type"
                      isClearable
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-4">
                    <label className="form-label fw-medium">Source File</label>
                    <FileDropzone
                      ref={fileDropzoneRef}
                      onFilesSelected={handleFilesSelected}
                      accept=".csv"
                      multiple={false}
                    />
                    <FileList
                      files={files}
                      onRemoveFile={handleRemoveFile}
                    />
                  </div>
                  {shouldShowUploadButton() && (
                    <ProgressButton
                      onClick={handleUploadClick}
                      disabled={isUploading || finalIsUploaded}
                      loading={isUploading}
                      progress={uploadProgress}
                      loadingText={`${uploadProgress}% Uploading File...`}
                      className="mt-4"
                    >
                      {finalIsUploaded ? 'File Uploaded' : 'Upload File'}
                    </ProgressButton>
                  )}

                  {/* Edit Loading Progress Bar */}
                  {isEditLoading && (
                    <LoadingProgress className="mt-4" />
                  )}
                  {/* Success Message */}
                  {finalIsUploaded && !isUploading && (
                    <SuccessAlert
                      message={isEditLoading
                        ? "File ready for mapping update!"
                        : "Source file uploaded successfully!"}
                      className="mt-4"
                    />
                  )}
                </div>
              )}
            </div>
            {/* Download Buttons */}
            {(downloadFileUrl || errorFileUrl) && (
              <div className="mt-3 text-center d-flex justify-content-center gap-3">
                {downloadFileUrl && (
                  <Button
                    variant="outline-primary"
                    size="lg"
                    href={downloadFileUrl}
                    rel="noopener noreferrer"
                    download
                  >
                    Download CSV
                  </Button>
                )}
                {errorFileUrl && (
                  <Button
                    variant="outline-danger"
                    size="lg"
                    href={errorFileUrl}
                    rel="noopener noreferrer"
                    download
                  >
                     Error CSV
                  </Button>
                )}
              </div>
            )}
            {/* Data Mapper Tool Section */}
            {finalIsUploaded && finalSourceFields.length > 0 && (
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-4">
                  <DatabaseMapper
                    sourceFields={finalSourceFields}
                    targetFields={[]}
                    fileId={finalFileId}
                    fieldTypes={finalFieldTypes}
                    forceExpand={forceExpandMapper}
                    isEditLoading={isEditLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapping Edit Modal */}
      <MappingEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        mapping={editingMapping}
        onSave={handleSaveMapping}
        isLoading={isUpdatingMapping}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        mappingId={deletingMapping?.id || ''}
        mappingName={deletingMapping?.name || ''}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default UploadFiles;