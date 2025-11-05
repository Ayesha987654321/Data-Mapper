import React from 'react';
import type { SuccessAlertProps } from '../utils/interfaces';

const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`alert alert-success d-flex align-items-center rounded-3 ${className}`} role="alert">
      <svg
        className="bi flex-shrink-0 me-2"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
      </svg>
      <div>{message}</div>
    </div>
  );
};

export default SuccessAlert; 