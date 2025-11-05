// components/FieldSelector.tsx
import React from 'react';
import type { FieldSelectorProps } from '../utils/interfaces';
import { FaCheck } from 'react-icons/fa';


const FieldSelector: React.FC<FieldSelectorProps> = ({
  title,
  fields,
  selectedField,
  onChange,
  isMapped,
}) => {
  return (
    <div className="col-md-6">
      <h6>{title}</h6>
      <select
        className="form-select"
        size={10}
        value={selectedField}
        onChange={(e) => onChange(e.target.value)}
      >
        {fields.map((field, i) => (
          <option key={i} value={field}>
            {field} {isMapped(field) ? <FaCheck /> : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FieldSelector;
