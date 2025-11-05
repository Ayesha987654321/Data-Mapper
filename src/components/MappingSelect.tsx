import React, { useState } from 'react';
import Select, { components } from 'react-select';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from './Button';
import type {MappingSelectProps } from '../utils/interfaces';

const CustomOption = ({ data, ...props }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = () => {
    const container = document.querySelector('.mapping-select-container') as any;
    if (container && container._onEditMapping) {
      container._onEditMapping(data.mapping);
    }
  };

  const handleDeleteClick = () => {
    const container = document.querySelector('.mapping-select-container') as any;
    if (container && container._onDeleteMapping) {
      container._onDeleteMapping(data.mapping);
    }
  };

  return (
    <components.Option {...props}>
      <div
        className="d-flex justify-content-between align-items-center w-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>{data.label}</span>
        {isHovered && (
          <div className="d-flex gap-1">
            <Button
              
              variant="link"
              size="lg"
              onClick={handleEditClick}
              title="Edit mapping"
              className="p-1"
            >
              <FaEdit size={20} />
            </Button>
            <Button
        
              variant="link"
              size="lg"
              onClick={handleDeleteClick}
              title="Delete mapping"
              className="p-1"
              style={{ color: 'red' }}
            >
              <FaTrash size={20} />
            </Button>
          </div>
        )}
      </div>
    </components.Option>
  );
};

const MappingSelect: React.FC<MappingSelectProps> = ({
  value,
  onChange,
  options,
  onEditMapping,
  onDeleteMapping,
  placeholder = "Choose a mapping type",
  isClearable = true,
  className = ""
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any)._onEditMapping = onEditMapping;
      (containerRef.current as any)._onDeleteMapping = onDeleteMapping;
    }
  }, [onEditMapping, onDeleteMapping]);

  return (
    <div ref={containerRef} className={`mapping-select-container ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        isClearable={isClearable}
        placeholder={placeholder}
        noOptionsMessage={() => "No record"}
        classNamePrefix="react-select"
        components={{
          Option: CustomOption
        }}
      />
    </div>
  );
};

export default MappingSelect; 