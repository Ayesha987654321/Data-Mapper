import React, { useState, useRef } from 'react';
import { FaCheck, FaTimes, FaUpload } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import Button from './Button';
import { targetFileUploadWithProgress } from '../services/requests';
import { toast } from 'react-toastify';
import type { TargetFieldSelectorProps } from '../utils/interfaces';
import { DATA_TYPE_OPTIONS } from '../utils/constants';

const TargetFieldSelector: React.FC<TargetFieldSelectorProps> = ({
  targetFields,
  selectedTargets,
  setSelectedTargets,
  isMapped,
  editId,
  originalMapping,
  onTargetsChange,
  setTargetFields,
  setMappings,
  getTargetFieldDisplay,
  selectedSource,
  getSourceFieldNumber,
  targetDataTypes,
  onTargetDataTypesChange,
  mappings,
  highlightTypeError,
  onClearTypeError,
}) => {
  const [editingTargetIndex, setEditingTargetIndex] = useState<number | null>(null);
  const [editingTargetValue, setEditingTargetValue] = useState<string>('');
  const [newTargetField, setNewTargetField] = useState('');
  const [targetFiles, setTargetFiles] = useState<File[]>([]);
  const [isTargetUploading, setIsTargetUploading] = useState(false);
  const [targetUploadProgress, setTargetUploadProgress] = useState(0);
  const [isTargetUploaded, setIsTargetUploaded] = useState(false);
  const [useManualTargetFields, setUseManualTargetFields] = useState(false);

  const targetFileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (field: string) => {
    setSelectedTargets(prev => {
      const updated = prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field];
      
      // If adding a field, only set default data type if none exists
      if (!prev.includes(field)) {
        onTargetDataTypesChange(prevTypes => ({
          ...prevTypes,
          [field]: prevTypes[field] || 'text' // Keep existing or default to text
        }));
      } else {
        // If removing a field, remove its data type
        onTargetDataTypesChange(prevTypes => {
          const newTypes = { ...prevTypes };
          delete newTypes[field];
          return newTypes;
        });
      }
      
      onTargetsChange(updated);
      return updated;
    });
  };

  // Handle data type change for a target field
  const handleDataTypeChange = (field: string, dataType: string) => {
    if (highlightTypeError) onClearTypeError();
    onTargetDataTypesChange(prev => ({
      ...prev,
      [field]: dataType
    }));
  };

  // Get data type for a target field
  const getDataTypeForField = (field: string) => {
    // During edit, for fields belonging to the original mapping, prefer the temporary selection
    if (editId && originalMapping && originalMapping.targetFields && originalMapping.targetFields.includes(field)) {
      if (targetDataTypes[field]) return targetDataTypes[field];
      const mapped = mappings.find(m => m.targetFields.includes(field));
      if (mapped && mapped.dataType) return mapped.dataType;
      return 'text';
    }
    // If field is already mapped (but not being edited), show saved mapping's type
    if (isMapped(field, 'target')) {
      const mapped = mappings.find(m => m.targetFields.includes(field));
      if (mapped && mapped.dataType) return mapped.dataType;
    }
    // Otherwise, use temporary selection
    if (targetDataTypes[field]) return targetDataTypes[field];
    // Default fallback
    return 'text';
  };

  const handleTargetFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');

      if (!isCSV) {
        toast.error('Only CSV files are allowed');
        return;
      }

      setTargetFiles([selectedFile]);
      // Reset upload state to allow re-uploading
      setIsTargetUploaded(false);
    }
  };

  const handleTargetUpload = async () => {
    if (targetFiles.length === 0) {
      toast.error('Please select a target file first');
      return;
    }

    // Clear previous data when upload button is clicked
    setTargetFields([]);
    setSelectedTargets([]);
    onTargetsChange([]);
    
    // Clear any existing mappings that use target fields
    setMappings((prev: any) => prev.filter((m: any) => {
      // Keep only mappings that don't have any target fields
      return m.targetFields.length === 0;
    }));

    setIsTargetUploading(true);
    setTargetUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', targetFiles[0]);

      const response = await targetFileUploadWithProgress(formData, (progress) => {
        setTargetUploadProgress(progress);
      });

      if (response && response.data) {
        console.log('Target file upload response:', response.data);
        // Extract headers from response.data.data object
        if (response.data.data && typeof response.data.data === 'object') {
          const headers = Object.keys(response.data.data.data);
          console.log('Extracted headers:', headers);
          
          // Replace existing target fields with new ones from uploaded file
          setTargetFields(headers);
          // Clear previously selected targets since we have new fields
          setSelectedTargets([]);
          onTargetsChange([]);
        }
        setIsTargetUploaded(true);
        toast.success('Target file uploaded successfully!');
      }
    } catch (error) {
      console.error('Target file upload failed:', error);
      toast.error('Failed to upload target file');
    } finally {
      setIsTargetUploading(false);
      setTargetUploadProgress(0);
    }
  };

  const handleRemoveTargetFile = () => {
    setTargetFiles([]);
    setIsTargetUploaded(false);
    setTargetFields([]);
    if (targetFileInputRef.current) {
      targetFileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-0">Target Data Fields</h5>
          <small className="text-muted">Select one or more fields to map to</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="manualTargetFields"
              checked={useManualTargetFields}
              onChange={(e) => {
                setUseManualTargetFields(e.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="manualTargetFields">
              Add manually
            </label>
          </div>

          <>
            <input
              type="file"
              ref={targetFileInputRef}
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleTargetFilesSelected(Array.from(files));
                  // Clear the input value to allow selecting the same file again
                  e.target.value = '';
                }
              }}
            />
                         <Button
               variant="outline-primary"
               size="sm"
               onClick={() => targetFileInputRef.current?.click()}
               disabled={isTargetUploading}
               title="Upload target file"
             >
               <FaUpload />
             </Button>
          </>

        </div>
      </div>
      <div className="card-body">
        {/* Show selected target file and upload button - only when not uploaded */}
        {targetFiles.length > 0 && !isTargetUploaded && (
          <div className="mb-3 p-2 bg-light rounded">
            <div className="d-flex align-items-center justify-content-between">
              <small className="text-muted">
                Selected: {targetFiles[0].name}
              </small>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveTargetFile()}
                >
                  <FaTimes />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTargetUpload}
                  disabled={isTargetUploading}
                >
                  {isTargetUploading ? `Uploading ${targetUploadProgress}%` : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedTargets.length > 0 && (
          <div className="selected-targets-container mb-3">
            {selectedTargets.map(field => (
              <div key={field} className="selected-target-badge d-flex align-items-center gap-2">
                <span className="field-name">{field}</span>
                <span className="text-muted ms-1">({getDataTypeForField(field)})</span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => handleToggle(field)}
                  className="remove-btn"
                >
                  <FaTimes />
                </Button>
              </div>
            ))}
          </div>
        )}
        {targetFields.length === 0 ? (
          <div className="field-selection-empty">
            <div className="text-center">
              <FaUpload className="mb-2" style={{ fontSize: '2rem', opacity: 0.5 }} />
              <p className="mb-0">No target fields available</p>
              <small>Upload a target file or add fields manually to get started</small>
            </div>
          </div>
        ) : (
          <div className="field-selection-area">
            {targetFields.map((field, idx) => (
              <div key={field + idx} className="mb-2">
                <div className="form-check d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`target-${field}-${idx}`}
                    checked={selectedTargets.includes(field)}
                    onChange={() => handleToggle(field)}
                    disabled={
                      isMapped(field, 'target') && !(editId && originalMapping && originalMapping.targetFields.includes(field))
                    }
                  />
                  
                  {/* Data Type Dropdown - always show for all fields */}
                  <select
                    className="form-select form-select-sm ms-2"
                    style={{ width: 'auto', minWidth: '100px', borderColor: highlightTypeError && selectedTargets.includes(field) ? '#dc3545' : undefined }}
                    value={getDataTypeForField(field)}
                    onChange={(e) => handleDataTypeChange(field, e.target.value)}
                    disabled={isMapped(field, 'target') && !(editId && originalMapping && originalMapping.targetFields.includes(field))}
                  >
                    {DATA_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {editingTargetIndex === idx ? (
                    <div className="input-group input-group-sm ms-2" style={{ width: 'auto' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={editingTargetValue}
                        autoFocus
                        onChange={e => setEditingTargetValue(e.target.value)}
                        onBlur={() => {
                          setEditingTargetIndex(null);
                          setEditingTargetValue('');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const trimmed = editingTargetValue.trim();
                            if (trimmed && !targetFields.includes(trimmed)) {
                              const oldValue = targetFields[idx];
                              setTargetFields(targetFields.map((f, i) => i === idx ? trimmed : f));
                              setSelectedTargets(selectedTargets.map(t => t === oldValue ? trimmed : t));
                              setMappings((prev: any) => prev.map((m: any) => ({
                                ...m,
                                targetFields: m.targetFields.map((t: string) => t === oldValue ? trimmed : t)
                              })));
                            }
                            setEditingTargetIndex(null);
                            setEditingTargetValue('');
                          } else if (e.key === 'Escape') {
                            setEditingTargetIndex(null);
                            setEditingTargetValue('');
                          }
                        }}
                      />
                      <Button
                        variant="outline-success"
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e: React.MouseEvent) => {
                          e.preventDefault();
                          const trimmed = editingTargetValue.trim();
                          if (trimmed && !targetFields.includes(trimmed)) {
                            const oldValue = targetFields[idx];
                            setTargetFields(targetFields.map((f, i) => i === idx ? trimmed : f));
                            setSelectedTargets(selectedTargets.map(t => t === oldValue ? trimmed : t));
                            setMappings((prev: any) => prev.map((m: any) => ({
                              ...m,
                              targetFields: m.targetFields.map((t: string) => t === oldValue ? trimmed : t)
                            })));
                          }
                          setEditingTargetIndex(null);
                          setEditingTargetValue('');
                        }}
                        title="Save"
                      >
                        <FaCheck />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const displayText = getTargetFieldDisplay(field);
                        // 1) If selected and a source is chosen, always show the current source number (orange) so it updates immediately in edit mode
                        if (selectedTargets.includes(field) && selectedSource) {
                          return (
                            <>
                              <span className="ms-2">
                                <span
                                  className="d-inline-flex align-items-center justify-content-center"
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#ffc107',
                                    color: 'black',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    minWidth: '20px'
                                  }}
                                >
                                  {getSourceFieldNumber(selectedSource)}
                                </span>
                              </span>
                              <label
                                className="form-check-label ms-2"
                                htmlFor={`target-${field}-${idx}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setEditingTargetIndex(idx);
                                  setEditingTargetValue(field);
                                }}
                              >
                                {displayText}
                              </label>
                            </>
                          );
                        }

                        // 2) Otherwise, if display text already includes mapped source numbers, show the blue badges
                        const match = displayText.match(/^(.+?)\s*\(([^)]+)\)$/);
                        if (match) {
                          const fieldName = match[1];
                          const numbers = match[2].split(',').map(n => n.trim());
                          return (
                            <>
                              <span className="ms-2">
                                {numbers.map((num, index) => (
                                  <React.Fragment key={index}>
                                    <span
                                      className="d-inline-flex align-items-center justify-content-center"
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        minWidth: '20px'
                                      }}
                                    >
                                      {num}
                                    </span>
                                    {index < numbers.length - 1 && <span className="mx-1">,</span>}
                                  </React.Fragment>
                                ))}
                              </span>
                              <label
                                className="form-check-label ms-2"
                                htmlFor={`target-${field}-${idx}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setEditingTargetIndex(idx);
                                  setEditingTargetValue(field);
                                }}
                              >
                                {fieldName}
                              </label>
                            </>
                          );
                        }

                        // 3) Default - plain label
                        return (
                          <label
                            className="form-check-label ms-2"
                            htmlFor={`target-${field}-${idx}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEditingTargetIndex(idx);
                              setEditingTargetValue(field);
                            }}
                          >
                            {displayText}
                          </label>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {useManualTargetFields && (
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <div className="mb-3">
              <div className="input-group">
                <input
                  type="text"
                  value={newTargetField}
                  onChange={e => setNewTargetField(e.target.value)}
                  placeholder="Add new target field"
                  className="form-control"
                />
                <Button
                  variant="outline-primary"
                  type="button"
                  title="Add Field"
                  onClick={() => {
                    if (newTargetField && !targetFields.includes(newTargetField)) {
                      setTargetFields([...targetFields, newTargetField]);
                      setNewTargetField('');
                    }
                  }}
                >
                  <FiPlus />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetFieldSelector; 