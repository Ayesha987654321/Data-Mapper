import React from 'react';
import { FaUndo } from 'react-icons/fa';
import Button from './Button';
import { HISTORY_FILTER_FIELDS } from '../utils/constants';

interface HistoryFilterProps {
  filters: {
    fileName: string;
    status: string;
    from: string;
    to: string;
  };
  onChange: (filters: any) => void;
  onReset: () => void;
  statusOptions: { label: string; value: string | number }[];
}

const HistoryFilter: React.FC<HistoryFilterProps> = ({ filters, onChange, onReset, statusOptions }) => {
  const renderField = (field: typeof HISTORY_FILTER_FIELDS[0]) => {
    const commonProps = {
      className: field.type === 'select' ? 'form-select' : 'form-control',
      value: filters[field.key as keyof typeof filters],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
        onChange({ ...filters, [field.key]: e.target.value })
    };

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type}
        placeholder={field.placeholder || ''}
      />
    );
  };

  return (
    <div className="row mb-3 align-items-end">
      {HISTORY_FILTER_FIELDS.map(field => (
        <div key={field.key} className={field.colClass}>
          <label className="form-label">{field.label}</label>
          {renderField(field)}
        </div>
      ))}
      <div className="col-md-2 d-flex align-items-end">
        <Button
          variant="primary"
          size="sm"
          onClick={onReset}
          className="ms-2"
        >
          <FaUndo className="me-1 mb-1 mt-1" size={16} />
          
        </Button>
      </div>
    </div>
  );
};

export default HistoryFilter; 