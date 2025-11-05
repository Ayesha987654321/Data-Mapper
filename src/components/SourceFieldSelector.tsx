import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';
import { getFileData } from '../services/requests';
import ViewMapping from './ViewMapping';

interface SourceFieldSelectorProps {
  sourceFields: string[];
  selectedSource: string;
  setSelectedSource: React.Dispatch<React.SetStateAction<string>>;
  fieldTypes: Record<string, string>;
  isMapped: (field: string, type: 'source' | 'target') => boolean;
  editId: string | null;
  originalMapping: any;
  getSourceFieldNumber: (field: string) => number;
  getMappedTargets: (field: string) => string[];
  fileId?: number | null;
}

const SourceFieldSelector: React.FC<SourceFieldSelectorProps> = ({
  sourceFields,
  selectedSource,
  setSelectedSource,
  fieldTypes,
  isMapped,
  editId,
  originalMapping,
  getSourceFieldNumber,
  getMappedTargets,
  fileId,
}) => {
  const [showMappingModal, setShowMappingModal] = useState<string | null>(null);
  const [showDataModal, setShowDataModal] = useState<string | null>(null);
  const [columnData, setColumnData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (field: string) => {
    setSelectedSource(field);
  };

  const handleViewData = async (field: string) => {
    if (!fileId) {
      console.error('File ID is required to view column data');
      return;
    }
    
    setShowDataModal(field);
    setCurrentPage(1);
    setColumnData([]);
    setHasMoreData(true);
    await loadColumnData(field, 1);
  };

  const loadColumnData = async (field: string, page: number) => {
    if (!fileId) return;
    
    console.log(`🔄 Starting loadColumnData for page ${page}, setting loading to true`);
    setLoading(true);
    console.log(`📊 Loading state set to: true for page ${page}`);
    try {
      const response = await getFileData({
        fileId,
        headerName: field,
        page,
        limit: 10
      });
      
      const newData = response.data.data.rows || [];
      if (page === 1) {
        setColumnData(newData);
        setHasMoreData(newData.length === 10);
        setCurrentPage(page);
      } else {
       
        const tempData = newData;
        
        // Wait exactly 1 second before showing the new data
        setTimeout(() => {
          setColumnData(prev => [...prev, ...tempData]);
          setHasMoreData(newData.length === 10);
          setCurrentPage(page);
          setLoading(false);
        }, 1000);
        
        return; // Exit early - don't execute the code below
      }
    } catch (error) {
      console.error('Error fetching column data:', error);
      if (page === 1) {
        setColumnData([]);
      }
    } finally {
      // Only set loading to false for initial loads (page 1)
      // For page > 1, loading will be set to false in the setTimeout
      if (page === 1) {
        console.log(`🏁 Page ${page} is initial load, setting loading to false in finally`);
        setLoading(false);
      } else {
        console.log(`🏁 Page ${page} is load more, loading will be set to false in setTimeout`);
      }
    }
  };

  const handleLoadMore = () => {
    if (showDataModal) {
      loadColumnData(showDataModal, currentPage + 1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMappingModal(null);
      }
    };

    if (showMappingModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMappingModal]);

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Source Data Field</h5>
        <small className="text-muted">Select one field to map from</small>
      </div>
      <div className="card-body">
        {selectedSource && (
          <div className="selected-source-container mb-3">
            <div className="selected-source-badge">
              <span className="field-name">{selectedSource}</span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => handleSelect('')}
                className="remove-btn"
              >
                <FaTimes />
              </Button>
            </div>
          </div>
        )}
                <div className="field-selection-area">
          {sourceFields.map(field => (
            <div key={field} className="mb-2">
              <div className="form-check d-flex align-items-center position-relative">
                <input
                  className="form-check-input me-2"
                  type="radio"
                  name="sourceFieldRadio"
                  id={`source-${field}`}
                  checked={selectedSource === field}
                  onChange={() => handleSelect(field)}
                  disabled={
                    isMapped(field, 'source') && !(editId && originalMapping && originalMapping.sourceField === field)
                  }
                />
                <span 
                  className="me-2 d-inline-flex align-items-center justify-content-center"
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
                  {getSourceFieldNumber(field)}
                </span>
                <label className="form-check-label flex-grow-1 me-2" htmlFor={`source-${field}`}>
                  {field}
                  {fieldTypes[field] && (
                    <span className="text-muted ms-1" style={{ fontSize: '0.95em' }}>
                      ({fieldTypes[field]})
                    </span>
                  )}
                </label>
                <div className="position-relative">
                  <svg 
                    width="17" 
                    height="17" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    onClick={() => handleViewData(field)}
                    className="ms-2"
                    style={{ 
                      cursor: 'pointer',
                      color: '#17a2b8'
                    }}
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data and Mapping Modal */}
      <ViewMapping
        isOpen={!!showDataModal}
        onClose={() => setShowDataModal(null)}
        columnName={showDataModal || ''}
        columnData={columnData}
        mappedTargets={showDataModal ? getMappedTargets(showDataModal) : []}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMoreData={hasMoreData}
        currentPage={currentPage}
      />
    </div>
  );
};

export default SourceFieldSelector; 