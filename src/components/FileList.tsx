import React from 'react';
import Button from './Button';
import type { FileListProps } from '../utils/interfaces';

const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  className = ''
}) => {
  if (files.length === 0) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="text-muted text-center py-3">
          <small>No files selected</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${className}`}>
      <h5 className="fw-medium mb-3">Selected File</h5>
      <ul className="list-group list-group-flush">
        {files.map((file, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between py-2"
          >
            <span className="text-truncate" style={{ maxWidth: '75%' }}>
              {file.name}
            </span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onRemoveFile(index)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList; 