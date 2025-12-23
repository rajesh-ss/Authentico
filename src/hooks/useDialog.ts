import { useState, useCallback } from 'react';

interface UseDialogReturn<T = undefined> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useDialog<T = undefined>(): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((dialogData?: T) => {
    setData(dialogData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => setData(null), 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

// Hook for managing multiple dialogs
interface DialogState {
  [key: string]: boolean;
}

interface UseMultiDialogReturn {
  dialogs: DialogState;
  openDialog: (name: string) => void;
  closeDialog: (name: string) => void;
  isDialogOpen: (name: string) => boolean;
}

export function useMultiDialog(initialDialogs: string[] = []): UseMultiDialogReturn {
  const [dialogs, setDialogs] = useState<DialogState>(() => 
    initialDialogs.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  );

  const openDialog = useCallback((name: string) => {
    setDialogs(prev => ({ ...prev, [name]: true }));
  }, []);

  const closeDialog = useCallback((name: string) => {
    setDialogs(prev => ({ ...prev, [name]: false }));
  }, []);

  const isDialogOpen = useCallback((name: string) => dialogs[name] ?? false, [dialogs]);

  return {
    dialogs,
    openDialog,
    closeDialog,
    isDialogOpen,
  };
}
