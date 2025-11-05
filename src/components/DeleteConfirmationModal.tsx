import React, { useState } from 'react';
import Button from './Button';
import { deleteUserMapping } from '../services/requests';
import { toast } from 'react-toastify';
import type { DeleteConfirmationModalProps } from '../utils/interfaces';

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  mappingId,
  mappingName,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUserMapping(mappingId);
      toast.success('Mapping deleted successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error('Failed to delete mapping: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">Delete Mapping</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">
              Are you sure you want to delete the mapping <strong>"{mappingName}"</strong>?
            </p>
            <p className="text-muted small mt-2 mb-0">
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              loading={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Mapping'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 