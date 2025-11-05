import React from 'react';
import type { PanelProps } from '../utils/interfaces';

const Panel: React.FC<PanelProps> = ({ title, icon, children, className = '', headerClassName = '', bodyClassName = '' }) => (
  <div className={`card shadow-sm border-0 ${className}`}>
    <div className={`card-header bg-white border-0 pb-0 d-flex align-items-center gap-2 ${headerClassName}`}>
      {icon && icon}
      <span className="fw-semibold">{title}</span>
    </div>
    <div className={`card-body ${bodyClassName}`}>
      {children}
    </div>
  </div>
);

export default Panel; 