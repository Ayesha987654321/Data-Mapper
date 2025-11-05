import React from 'react';

interface StatusBadgeProps {
  status: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 0:
      return <span className="badge bg-warning">Unmapped</span>;
    case 1:
      return <span className="badge bg-success">Mapped</span>;
    default:
      return <span className="badge bg-secondary">Unknown</span>;
  }
};

export default StatusBadge; 