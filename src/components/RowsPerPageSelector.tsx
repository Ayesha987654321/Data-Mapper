import React from 'react';

interface RowsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

const RowsPerPageSelector: React.FC<RowsPerPageSelectorProps> = ({ value, onChange, options = [10, 20, 30, 40, 50], className = '' }) => (
  <div className={`d-inline-flex align-items-center ${className}`}>
    <label className="me-2 fw-normal mb-0">Rows per page:</label>
    <select
      className="form-select d-inline-block w-auto"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ minWidth: 80 }}
    >
      {options.map(size => (
        <option key={size} value={size}>{size}</option>
      ))}
    </select>
  </div>
);

export default RowsPerPageSelector; 