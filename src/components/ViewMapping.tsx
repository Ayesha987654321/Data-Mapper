import React, { useRef } from 'react';
import Button from './Button';

interface ViewMappingProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string;
  columnData: any[];
  mappedTargets: string[];
  loading: boolean;
  onLoadMore: () => void;
  hasMoreData: boolean;
  currentPage: number;
}

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f8f9fa;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #d3d3d3;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #c0c0c0;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #d3d3d3 #f8f9fa;
    }
  `;

const ViewMapping: React.FC<ViewMappingProps> = ({
  isOpen,
  onClose,
  columnName,
  columnData,
  mappedTargets,
  loading,
  onLoadMore,
  hasMoreData,
  
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

 

  // Handle scroll to load more data
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
  
    
    // Check if we're near the bottom (within 50px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (isNearBottom && hasMoreData && !loading) {
      onLoadMore();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
             {columnName}
            </h5>
            <button
              onClick={onClose}
              className="btn-close"
            >
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Left side - Mapped Target Columns */}
              <div className="col-md-6">
                <h6 className="mb-3"> Target Columns</h6>
                <div className="border rounded p-3">
                  {mappedTargets.length > 0 ? (
                    mappedTargets.map(target => (
                      <span key={target} className="badge bg-primary text-white me-2 mb-2 d-inline-block">
                        {target}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No target columns mapped</p>
                  )}
                </div>
              </div>
              
              {/* Right side - Source Column Data */}
              <div className="col-md-6">
                <h6 className="mb-3">Source Column Data</h6>
                <div className="border rounded p-3">
                                     {loading && columnData.length === 0 ? (
                     <div className="text-center py-4">
                       <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                         <span className="visually-hidden">Loading...</span>
                       </div>
                       <p className="mt-3 mb-0 text-muted">Loading column data...</p>
                     </div>
                   ) : columnData.length > 0 ? (
                    <div>
                                              <p className="text-muted small mb-2">Showing {columnData.length} rows:</p>
                                                                     <div 
                          ref={tableRef}
                          className="table-responsive custom-scrollbar" 
                          style={{ 
                            height: '300px',
                            overflowY: 'auto',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            backgroundColor: '#f8f9fa'
                          }}
                          onScroll={handleScroll}
                        >
                         <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Value</th>
                            </tr>
                          </thead>
                                                      <tbody>
                              {columnData.map((row, index) => (
                                <tr key={index}>
                                 <td>
                                     {JSON.stringify(row)}
                                   </td>
                                </tr>
                              ))}
                            </tbody>
                        </table>
                                              </div>
                                                                                                   {hasMoreData && loading && (
                            <div className="text-center mt-3">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                  <span className="visually-hidden">Loading more data...</span>
                                </div>
                                <span className="text-primary">Loading more data...</span>
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No data available</p>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
                 </div>
       </div>
     </div>
     </>
   );
 };

export default ViewMapping; 