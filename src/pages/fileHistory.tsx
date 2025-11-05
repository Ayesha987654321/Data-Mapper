import  { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getFileHistory } from '../services/requests';
import MappingModal from '../components/MappingModal';
import Pagination from '../components/Pagination';
import HistoryTable from '../components/HistoryTable';
import HistoryFilter from '../components/HistoryFilter';
import StatusBadge from '../components/StatusBadge';
import Panel from '../components/Panel';
import RowsPerPageSelector from '../components/RowsPerPageSelector';
import { FILE_STATUS_OPTIONS } from '../utils/constants';

const FileHistory = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    fileName: '',
    status: '',
  });
  const [fileHistory, setFileHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    // Build API params with only selected filters using map
    const filterMappings = [
      { key: 'fileName', apiKey: 'fileName', transform: (value: string) => value },
      { key: 'status', apiKey: 'fileStatus', transform: (value: string) => value !== '' ? Number(value) : undefined },
      { key: 'from', apiKey: 'startDate', transform: (value: string) => value },
      { key: 'to', apiKey: 'endDate', transform: (value: string) => value }
    ];

    const apiParams = {
      page,
      limit: pageSize,
      ...filterMappings.reduce((acc, mapping) => {
        const value = filters[mapping.key as keyof typeof filters];
        if (value) {
          const transformedValue = mapping.transform(value);
          if (transformedValue !== undefined) {
            acc[mapping.apiKey] = transformedValue;
          }
        }
        return acc;
      }, {} as Record<string, any>)
    };
    
    getFileHistory(apiParams)
      .then(res => {
        if (mounted) {
          const rows = Array.isArray(res.data) ? res.data : res.data.data.rows || [];
          setFileHistory(rows);
          setTotalCount(res.data.data.count || rows.length);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err?.message || 'Failed to fetch file history');
          setIsLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [page, pageSize, filters]); // Add filters to dependencies

  const handleViewMapping = (row: any) => {
    // Check if targetFile exists and has pattern
    if (row.targetFile && Array.isArray(row.targetFile) && row.targetFile.length > 0) {
      const pattern = row.targetFile[0].pattern;
      if (pattern) {
        setSelectedMapping({
          fileName: row.fileName || 'Unknown File',
          pattern: pattern
        });
        setShowModal(true);
      } else {
        alert('No mapping pattern found for this file.');
      }
    } else {
      alert('No target file or mapping data available.');
    }
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMapping(null);
  };

  return (
    <div className="container-fluid py-4" style={{ background: '#f8f9fa' }}>
      <h2 className="mb-4 fw-bold text-center">File History</h2>
      {/* Filters */}
      <Panel
        title="Filters"
        icon={<FaFilter className="text-primary" />}
        className="mb-4"
        headerClassName="pb-0"
        bodyClassName="pt-3 pb-2"
      >
        <HistoryFilter
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ fileName: '', status: '', from: '', to: '' })}
          statusOptions={FILE_STATUS_OPTIONS}
        />
      </Panel>
      {/* Table */}
      <Panel
        title="History Table"
        className=""
        headerClassName="pb-0 d-flex justify-content-between align-items-center"
        bodyClassName="pt-3"
        icon={null}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <RowsPerPageSelector
            value={pageSize}
            onChange={size => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="d-flex justify-content-center">
            <HistoryTable
              data={fileHistory}
              onEdit={row => navigate('/uploadFiles', { state: { fileId: row.id } })}
              onView={handleViewMapping}
              statusBadge={(status: number) => <StatusBadge status={status} />}
              isLoading={isLoading}
              currentPage={page}
              pageSize={pageSize}
            />
          </div>
          {!isLoading && (
            <Pagination
              currentPage={page}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
          {error && <div className="text-danger">{error}</div>}
        </div>
      </Panel>
      {/* Mapping Modal Component */}
      <MappingModal
        isOpen={showModal}
        onClose={handleCloseModal}
        fileName={selectedMapping?.fileName || ''}
        pattern={selectedMapping?.pattern || {}}
      />
    </div>
  );
};

export default FileHistory;