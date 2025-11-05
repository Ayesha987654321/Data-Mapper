import React from 'react';
import Button from './Button';

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  pattern: any;
}

const MappingModal: React.FC<MappingModalProps> = ({ isOpen, onClose, fileName, pattern }) => {
  if (!isOpen) return null;

  // Convert pattern object to table data
  const tableData = Object.entries(pattern || {}).map(([fieldName, config]: [string, any]) => ({
    fieldName,
    type: config.type || 'N/A',
    columns: Array.isArray(config.columns) ? config.columns.join(', ') : 'N/A'
  }));

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          backdropFilter: 'blur(2px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ 
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050
        }} 
        tabIndex={-1}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title">Mapping Pattern - {fileName}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              >
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <h6 className="fw-semibold mb-3">Mapping Configuration:</h6>
                
                {/* Table View */}
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Field Name</th>
                        <th>Data Type</th>
                        <th>Source Columns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length > 0 ? (
                        tableData.map((row, index) => (
                          <tr key={index}>
                            <td className="fw-semibold text-primary">{row.fieldName}</td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info">
                                {row.type}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                {row.columns}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-muted">
                            No mapping data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* JSON View (Collapsible) */}
                <div className="mt-4">
                  <details>
                    <summary className="fw-semibold text-muted cursor-pointer">
                      View Raw JSON
                    </summary>
                    <pre 
                      className="mt-2"
                      style={{ 
                        fontSize: '0.85em', 
                        background: '#f8f9fa', 
                        borderRadius: 6, 
                        padding: 12, 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      {JSON.stringify(pattern, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MappingModal; 