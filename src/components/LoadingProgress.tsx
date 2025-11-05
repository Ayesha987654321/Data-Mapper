import React from 'react';
import type { LoadingProgressProps } from '../utils/interfaces';

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  message = 'Loading...',
  className = '',
  style = {}
}) => {
  return (
    <div className={`position-relative w-100 ${className}`} style={{ height: '2.5rem', ...style }}>
      <div className="progress" style={{ height: '100%' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-info"
          role="progressbar"
          style={{ width: '100%', fontWeight: 'bold', fontSize: '1.1rem' }}
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress; 