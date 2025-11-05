import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import MappingActions from './MappingActions';
import MappingsTable from './MappingsTable';
import type { FieldMapping, DatabaseMapperProps } from '../utils/interfaces';
import { defaultSourceFields } from '../utils/constants';
import SourceFieldSelector from './SourceFieldSelector';
import TargetFieldSelector from './TargetFieldSelector';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useFileStore } from '../stores/fileStore';
import Button from './Button';

interface DatabaseMapperExtraProps {
  forceExpand?: number;
  isEditLoading?: boolean;
}

const DatabaseMapper: React.FC<DatabaseMapperProps & DatabaseMapperExtraProps> = ({ sourceFields = defaultSourceFields, targetFields: propTargetFields = [], fileId, fieldTypes = {}, forceExpand, isEditLoading }) => {
  const [selectedSource, setSelectedSource] = useState<string>(''); // single source
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [targetFields, setTargetFields] = useState<string[]>(propTargetFields);
  const [targetDataTypes, setTargetDataTypes] = useState<Record<string, string>>({});
  const [highlightTypeError, setHighlightTypeError] = useState(false);


  const [editId, setEditId] = useState<string | null>(null); // for editing
  const [originalMapping, setOriginalMapping] = useState<FieldMapping | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasAutoCollapsedRef = useRef(false);
  const didInitTargetFieldsRef = useRef(false);
  const [showSaveMapping, setShowSaveMapping] = useState(false);
  const [mappingName, setMappingName] = useState('');

  // Zustand store
  const {
    isSubmitting,
        submitProgress,
    mappedFileUrl,
    errorFileUrl,
    submitMappings,
    submitError,
    isSavingMapping,
    saveUserMapping,
    fetchAllPatterns,
  } = useFileStore();

  useEffect(() => {
    if ((mappedFileUrl || errorFileUrl) && !hasAutoCollapsedRef.current) {
      setIsCollapsed(true);
      hasAutoCollapsedRef.current = true;
    }
    if (!mappedFileUrl && !errorFileUrl) {
      hasAutoCollapsedRef.current = false;
    }
  }, [mappedFileUrl, errorFileUrl]);

  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsCollapsed(false);
    }
  }, [forceExpand]);

  // Sync target fields from props only when props have values to avoid clearing existing fields
  useEffect(() => {
    if (Array.isArray(propTargetFields) && propTargetFields.length > 0) {
      setTargetFields(propTargetFields);
      didInitTargetFieldsRef.current = true;
    }
  }, [propTargetFields]);

  const handleAddMapping = () => {
    if (!selectedSource && selectedTargets.length === 0) {
      toast.error('Please select a source field and at least one target field');
      return;
    }
    if (!selectedSource) {
      toast.error('Please select a source field');
      return;
    }
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one target field');
      return;
    }
    
    // First check: all target fields should have the same data type
    const targetDataTypesArray = selectedTargets.map(target => targetDataTypes[target] || 'text');
    const uniqueTargetDataTypes = [...new Set(targetDataTypesArray)];
    
    if (uniqueTargetDataTypes.length > 1) {
      toast.error('All target fields must have the same data type');
      setHighlightTypeError(true);
      return;
    }
    
    const targetDataType = uniqueTargetDataTypes[0];
    
    // Second check: source field data type should match target data type
    const sourceDataType = fieldTypes[selectedSource] || 'text';
    if (sourceDataType !== targetDataType) {
      toast.error(`Source field data type (${sourceDataType}) must match target data type (${targetDataType})`);
      setHighlightTypeError(true);
      return;
    }
    
    if (editId) {
      // Save edit
      setMappings(prev => prev.map(m => m.id === editId ? {
        ...m,
        sourceField: selectedSource,
        targetFields: [...selectedTargets],
        dataType: targetDataType,
      } : m));
      setEditId(null);
      setOriginalMapping(null);
    } else {
      // Add new mapping with all target fields
      const newMapping: FieldMapping = {
        id: Date.now().toString(),
        sourceField: selectedSource,
        targetFields: [...selectedTargets],
        dataType: targetDataType,
      };
      setMappings(prev => [...prev, newMapping]);
    }
    
    // Clear selections and data types after adding mapping
    setSelectedSource('');
    setSelectedTargets([]);
    setTargetDataTypes({});
    setHighlightTypeError(false);
  };

  const handleEditMapping = (mapping: FieldMapping) => {
    setEditId(mapping.id);
    setOriginalMapping(mapping);
    setSelectedSource(mapping.sourceField); // Set selected source when editing
    setSelectedTargets([...mapping.targetFields]); // Set selected targets when editing
    
    // Set target data types for editing
    const dataTypes: Record<string, string> = {};
    mapping.targetFields.forEach(targetField => {
      dataTypes[targetField] = mapping.dataType || 'text';
    });
    setTargetDataTypes(dataTypes);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setOriginalMapping(null);
    setSelectedSource('');
    setSelectedTargets([]);
    setTargetDataTypes({});
  };

  const handleDeleteMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
    if (editId === id) handleCancelEdit();
  };

  const handleSubmit = async () => {
    if (mappings.length === 0) {
      toast.error('Please add at least one mapping');
      return;
    }
    const result = await submitMappings(fileId ?? null, mappings);
    if (result) {
      toast.success('Mapping submitted successfully!');
    } else {
      toast.error(submitError || 'Failed to submit mapping');
    }
  };

  // Save Mapping Handler
  const handleSaveMapping = async () => {
    if (!mappingName.trim()) {
      toast.error('Please enter a mapping name');
      return;
    }
    if (mappings.length === 0) {
      toast.error('No mappings to save');
      return;
    }
    // Build the pattern payload with data types
    const pattern: Record<string, { columns: string[]; type: string }> = {};
    mappings.forEach(m => {
      pattern[m.sourceField] = {
        columns: m.targetFields,
        type: m.dataType || 'text',
      };
    });
    const success = await saveUserMapping(mappingName, pattern);
    if (success) {
      toast.success('Mapping saved successfully!');
      setShowSaveMapping(false);
      setMappingName('');
      fetchAllPatterns(); // Refresh patterns after saving
    } else {
      toast.error('Failed to save mapping');
    }
  };

  const isMapped = (field: string, type: 'source' | 'target') => {
    return mappings.some(m =>
      type === 'source'
        ? m.sourceField === field
        : m.targetFields.includes(field)
    );
  };

  const getMappedCount = (field: string, type: 'source' | 'target') => {
    return mappings.filter(m =>
      type === 'source'
        ? m.sourceField === field
        : m.targetFields.includes(field)
    ).length;
  };

  // Get source field number (1-based index)
  const getSourceFieldNumber = (field: string) => {
    return sourceFields.indexOf(field) + 1;
  };

  // Get target field display with source numbers
  const getTargetFieldDisplay = (targetField: string) => {
    const mappedSources = mappings.filter(m => m.targetFields.includes(targetField));
    if (mappedSources.length === 0) return targetField;
    
    const sourceNumbers = mappedSources.map(m => getSourceFieldNumber(m.sourceField));
    return `${targetField} (${sourceNumbers.join(', ')})`;
  };

  // Get mapped targets for a source field
  const getMappedTargets = (sourceField: string) => {
    const mapping = mappings.find(m => m.sourceField === sourceField);
    return mapping ? mapping.targetFields : [];
  };

  return (
    <div className="container bg-white p-4 border border-primary rounded">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="mb-0 text-dark">Advanced Data Mapping</h3>
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsCollapsed(c => !c)}
          tabIndex={-1}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </Button>
      </div>
      {!isCollapsed && (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <SourceFieldSelector
                sourceFields={sourceFields}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                fieldTypes={fieldTypes}
                isMapped={isMapped}
                editId={editId}
                originalMapping={originalMapping}
                getSourceFieldNumber={getSourceFieldNumber}
                getMappedTargets={getMappedTargets}
                fileId={fileId}
              />
            </div>

            <div className="col-md-6">
              <TargetFieldSelector
                targetFields={targetFields}
                selectedTargets={selectedTargets}
                setSelectedTargets={setSelectedTargets}
                isMapped={isMapped}
                getMappedCount={getMappedCount}
                editId={editId}
                originalMapping={originalMapping}
                onTargetsChange={setSelectedTargets}
                setTargetFields={setTargetFields}
                setMappings={setMappings}
                getTargetFieldDisplay={getTargetFieldDisplay}
                selectedSource={selectedSource}
                getSourceFieldNumber={getSourceFieldNumber}
                targetDataTypes={targetDataTypes}
                onTargetDataTypesChange={setTargetDataTypes}
                mappings={mappings}
                highlightTypeError={highlightTypeError}
                onClearTypeError={() => setHighlightTypeError(false)}
              />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <MappingActions
                editId={editId}
                handleAddMapping={handleAddMapping}
                handleCancelEdit={handleCancelEdit}
                selectedSource={selectedSource}
                selectedTargets={selectedTargets}
              />
            </div>
          </div>

          <MappingsTable
            mappings={mappings}
            editId={editId}
            fieldTypes={fieldTypes}
            handleEditMapping={handleEditMapping}
            handleDeleteMapping={handleDeleteMapping}
          />

          {mappings.length > 0 && (
            <div className="mt-4 text-center d-flex flex-column align-items-center gap-2">
              {isEditLoading ? (
                <div className="w-100 mb-3">
                  <div className="progress" style={{ height: '2rem', width: '100%' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: `100%`, fontWeight: 'bold', fontSize: '1.1rem' }}
                      aria-valuenow={100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="mt-2 text-center">Loading...</div>
                </div>
              ) : isSubmitting ? (
                <div className="w-100 mb-3">
                  <div className="progress" style={{ height: '2rem', width: '100%' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: `${submitProgress}%`, fontWeight: 'bold', fontSize: '1.1rem' }}
                      aria-valuenow={submitProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {submitProgress}%
                    </div>
                  </div>
                  <div className="mt-2 text-center">Uploading...</div>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 justify-content-center w-100">
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    Submit All Mappings
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    onClick={() => setShowSaveMapping(s => !s)}
                    disabled={isSavingMapping}
                  >
                    Save Mapping
                  </Button>
                </div>
              )}
              {showSaveMapping && (
                <div className="d-flex align-items-center gap-1 mt-2" style={{ maxWidth: 300, width: '100%' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter mapping name"
                    value={mappingName}
                    onChange={e => setMappingName(e.target.value)}
                    disabled={isSavingMapping}
                    style={{ maxWidth: 140 }}
                  />
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={handleSaveMapping}
                    disabled={isSavingMapping}
                  >
                    {isSavingMapping ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {(mappedFileUrl || errorFileUrl) && (
        <div className="mt-3 text-center">
          <div className="d-flex align-items-center gap-3 justify-content-center">
            {mappedFileUrl && (
              <Button
                variant="outline-primary"
                size="lg"
                href={mappedFileUrl}
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
        </div>
      )}
    </div>
  );
};

export default DatabaseMapper;
