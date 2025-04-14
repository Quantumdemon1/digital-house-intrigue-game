
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PromiseList from './PromiseList';

interface PromiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PromiseDialog: React.FC<PromiseDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promises</DialogTitle>
        </DialogHeader>
        <PromiseList showAll={true} />
      </DialogContent>
    </Dialog>
  );
};

export default PromiseDialog;
