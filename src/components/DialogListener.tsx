import React, { useEffect, useState } from 'react';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle
} from '@/components/franky-ui-kit/AlertDialog';
import { eventBus } from '@/plugins/EventBus';

interface DialogParams {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
}

const DialogListener: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<DialogParams>({
    title: "",
    description: "",
    confirmLabel: "OK",
    cancelLabel: "Cancel",
  });
  const [callback, setCallback] = useState<(result: boolean) => void>(
    () => () => {}
  );

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      "api:openDialog",
      (p: DialogParams, cb: (res: boolean) => void) => {
        setParams(p);
        setCallback(() => cb);
        setOpen(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    callback(result);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{params.title}</AlertDialogTitle>
          </AlertDialogHeader>
          {params.description && (
            <AlertDialogDescription>
              {params.description}
            </AlertDialogDescription>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {params.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleClose(true)}>
              {params.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default DialogListener;
