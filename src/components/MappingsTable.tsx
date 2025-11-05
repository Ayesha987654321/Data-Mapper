import React from 'react';
import type { MappingsTableProps } from '../utils/interfaces';
import Button from './Button';

const MappingsTable: React.FC<MappingsTableProps> = ({
  mappings,
  editId,
  handleEditMapping,
  handleDeleteMapping,
}) => (
  <div className="card">
    <div className="card-header">
      <h5 className="mb-0">Mapped Relationships</h5>
    </div>
    <div className="card-body">
      {mappings.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Source Field</th>
                <th>Target Fields</th>
                <th style={{ width: '160px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr key={mapping.id} className={editId === mapping.id ? 'table-info' : ''}>
                  <td>
                    <span className="badge bg-primary">{mapping?.sourceField}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {mapping?.targetFields?.map(field => (
                        <span key={field} className="badge bg-success">{field}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditMapping(mapping)}
                        disabled={!!editId && editId !== mapping.id}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteMapping(mapping.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-muted py-4">
          <p>No mappings added yet.</p>
          <p>Select a source and one or more target fields above to create mappings.</p>
        </div>
      )}
    </div>
  </div>
);

export default MappingsTable; 