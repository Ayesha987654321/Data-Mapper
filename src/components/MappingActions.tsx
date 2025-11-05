import React from 'react';
import type { MappingActionsProps } from '../utils/interfaces';
import Button from './Button';

const MappingActions: React.FC<MappingActionsProps> = ({
  editId,
  handleAddMapping,
  handleCancelEdit,
}) => (
  <div className="d-flex align-items-center gap-2">
    <Button variant="primary" onClick={handleAddMapping}>
      {editId ? 'Save Changes' : 'Add Mapping'}
    </Button>
    {editId && (
      <Button variant="secondary" onClick={handleCancelEdit}>
        Cancel
      </Button>
    )}
  </div>
);

export default MappingActions; 