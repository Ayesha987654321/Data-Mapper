import React, { useState, useEffect } from 'react';
import Button from './Button';
import { FaTimes, FaPlus } from 'react-icons/fa';
import type { MappingPattern, MappingEditModalProps } from '../utils/interfaces';
import { DATA_TYPE_OPTIONS } from '../utils/constants';

const MappingEditModal: React.FC<MappingEditModalProps> = ({
  isOpen,
  onClose,
  mapping,
  onSave,
  isLoading = false
}) => {
  const [mappingName, setMappingName] = useState('');
  const [patterns, setPatterns] = useState<MappingPattern[]>([]);
  const [newTargetField, setNewTargetField] = useState('');
  const [showAddField, setShowAddField] = useState<number | null>(null);

  // Initialize form when mapping changes
  useEffect(() => {
    if (mapping) {
      setMappingName(mapping.name);
      // Convert pattern object to array format
      const patternsArray: MappingPattern[] = Object.entries(mapping.pattern).map(([sourceField, details]) => ({
        sourceField,
        targetFields: details.columns,
        dataType: details.type
      }));
      setPatterns(patternsArray);
    }
  }, [mapping]);

  const handleSave = async () => {
    if (!mapping || !mappingName.trim()) {
      return;
    }

    // Convert patterns array back to object format
    const patternObject: Record<string, { columns: string[]; type: string }> = {};
    patterns.forEach(pattern => {
      if (pattern.sourceField && pattern.targetFields.length > 0) {
        patternObject[pattern.sourceField] = {
          columns: pattern.targetFields,
          type: pattern.dataType || 'string'
        };
      }
    });

    const payload = {
      id: mapping.id,
      name: mappingName.trim(),
      pattern: patternObject
    };

    await onSave(payload);
  };

  const updatePattern = (index: number, field: keyof MappingPattern, value: any) => {
    const updatedPatterns = [...patterns];
    updatedPatterns[index] = { ...updatedPatterns[index], [field]: value };
    setPatterns(updatedPatterns);
  };

  const addTargetField = (patternIndex: number) => {
    if (newTargetField.trim()) {
      const updatedPatterns = [...patterns];
      updatedPatterns[patternIndex].targetFields.push(newTargetField.trim());
      setPatterns(updatedPatterns);
      setNewTargetField('');
      setShowAddField(null);
    }
  };

  const removeTargetField = (patternIndex: number, targetFieldIndex: number) => {
    const updatedPatterns = [...patterns];
    updatedPatterns[patternIndex].targetFields.splice(targetFieldIndex, 1);
    setPatterns(updatedPatterns);
  };

  const updateTargetField = (patternIndex: number, targetFieldIndex: number, value: string) => {
    const updatedPatterns = [...patterns];
    updatedPatterns[patternIndex].targetFields[targetFieldIndex] = value;
    setPatterns(updatedPatterns);
  };

  const toggleAddField = (patternIndex: number) => {
    if (showAddField === patternIndex) {
      setShowAddField(null);
      setNewTargetField('');
    } else {
      setShowAddField(patternIndex);
      setNewTargetField('');
    }
  };

  if (!isOpen || !mapping) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Mapping: {mapping.name}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Mapping Name */}
            <div className="mb-4">
              <label className="form-label fw-medium">Mapping Name</label>
              <input
                type="text"
                className="form-control"
                value={mappingName}
                onChange={(e) => setMappingName(e.target.value)}
                placeholder="Enter mapping name"
              />
            </div>

            {/* Patterns */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-medium">Mapping Patterns</h6>
              </div>

              {patterns.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No patterns defined.
                </div>
              ) : (
                <div className="row g-3">
                  {patterns.map((pattern, patternIndex) => (
                    <div key={patternIndex} className="col-12">
                      <div className="card border">
                        <div className="card-header">
                          <h6 className="mb-0">Pattern {patternIndex + 1}</h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            {/* Source Field - Read Only */}
                            <div className="col-md-6">
                              <label className="form-label fw-medium">Source Field</label>
                              <input
                                type="text"
                                className="form-control"
                                value={pattern.sourceField}
                                readOnly
                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                              />
                            </div>

                            {/* Data Type */}
                            <div className="col-md-6">
                              <label className="form-label fw-medium">Data Type</label>
                              <select
                                className="form-select"
                                value={pattern.dataType}
                                onChange={(e) => updatePattern(patternIndex, 'dataType', e.target.value)}
                              >
                                {DATA_TYPE_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Display Target Fields */}
                          <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <label className="form-label fw-medium mb-0">Current Target Fields:</label>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => toggleAddField(patternIndex)}
                                icon={<FaPlus />}
                                className="p-1"
                                style={{ fontSize: '0.7rem' }}
                              >
                                Add
                              </Button>
                            </div>

                            {pattern.targetFields.length > 0 && (
                              <div className="row g-2">
                                {pattern.targetFields.map((targetField, targetFieldIndex) => (
                                  <div key={targetFieldIndex} className="col-md-6">
                                    <div className="d-flex gap-2 align-items-center">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={targetField}
                                        onChange={(e) => updateTargetField(patternIndex, targetFieldIndex, e.target.value)}
                                        placeholder="Target field name"
                                      />
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeTargetField(patternIndex, targetFieldIndex)}
                                        className="p-1"
                                        style={{ fontSize: '0.7rem' }}
                                      >
                                        <FaTimes />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Target Field Input */}
                            {showAddField === patternIndex && (
                              <div className="row g-2 mt-2">
                                <div className="col-md-6">
                                  <div className="d-flex gap-2 align-items-center">
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={newTargetField}
                                      onChange={(e) => setNewTargetField(e.target.value)}
                                      placeholder="New target field name"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          addTargetField(patternIndex);
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => addTargetField(patternIndex)}
                                      className="p-1"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      <FaPlus />
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => toggleAddField(patternIndex)}
                                      className="p-1"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      <FaTimes />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              loading={isLoading}
              disabled={!mappingName.trim() || patterns.length === 0}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingEditModal; 