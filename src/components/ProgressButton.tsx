import React from 'react';
import Button from './Button';
import type { ProgressButtonProps } from '../utils/interfaces';

const ProgressButton: React.FC<ProgressButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  progress = 0,
  loadingText,
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className="position-relative">
      <Button
        variant="primary"
        onClick={onClick}
        disabled={disabled}
        fullWidth
        className={`position-relative overflow-hidden ${className}`}
        style={{ height: '2.5rem', fontWeight: 'bold', fontSize: '1.1rem', ...style }}
      >
        {loading && (
          <div
            className="position-absolute top-0 start-0 h-100 bg-info bg-opacity-50"
            style={{ 
              width: `${progress}%`, 
              zIndex: 1, 
              transition: 'width 0.3s' 
            }}
          />
        )}
        <span style={{ 
          position: 'relative', 
          zIndex: 2, 
          color: loading ? '#222' : undefined 
        }}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Button>
    </div>
  );
};

export default ProgressButton; 