import React from 'react';
import Button from './Button';
import { FaEdit, FaEye } from 'react-icons/fa';

interface HistoryTableProps {
  data: any[];
  onEdit: (row: any) => void;
  onView: (row: any) => void;
  statusBadge: (status: number) => React.ReactNode;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data, onEdit, onView, statusBadge, isLoading, currentPage = 1, pageSize = 10 }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle" style={{ minWidth: 1200, width: '100%' }}>
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th style={{ minWidth: 60, maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Upload Time</th>
            <th style={{ minWidth: 80, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Source File</th>
            <th style={{ minWidth: 80, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Target File</th>
            <th style={{ minWidth: 40, maxWidth: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</th>
            <th  className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="text-center py-5">
                <div className="d-flex justify-content-center align-items-center">
                  <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40 }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, index) => {
              const startNumber = (currentPage - 1) * pageSize + 1;
              return (
              <tr key={row.id}>
                <td className="fw-semibold">{startNumber + index}</td>
                <td style={{ minWidth: 60, maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '')
                    : ''}
                </td>
                <td style={{ minWidth: 80, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <a
                    className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                    href={typeof row.filePath === 'string' ? row.filePath : '#'}
                    rel="noopener noreferrer"
                    title={typeof row.fileName === 'string' ? row.fileName : '[No Name]'}
                  >
                    {typeof row.fileName === 'string' ? row.fileName : '[No Name]'}
                  </a>
                </td>
                <td style={{ minWidth: 80, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <a
                    className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                    href={typeof row?.targetFile[0]?.filePath === 'string' ? row.targetFile[0].filePath : '#'}
                    rel="noopener noreferrer"
                    title={typeof row?.targetFile[0]?.fileName === 'string' ? row.targetFile[0].fileName : '[No Name]'}
                  >
                    {typeof row?.targetFile[0]?.fileName === 'string' ? row?.targetFile[0]?.fileName : '[No Name]'}
                  </a>
                </td>
                <td style={{ minWidth: 40, maxWidth: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{statusBadge(row.fileStatus)}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center">
                    {row.fileStatus === 0 ? (
                      <Button
                        variant="link"
                        size="md"
                        onClick={() => onEdit(row)}
                        icon={<FaEdit />}
                        className="d-flex align-items-center p-0"
                      >
                        {""}
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        size="md"
                        onClick={() => onView(row)}
                        icon={<FaEye />}
                        className="d-flex align-items-center p-0"
                      >
                        {""}
                      </Button>
                    )}
                  </div>
                                 </td>
               </tr>
             );
             })
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">No file history found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable; 