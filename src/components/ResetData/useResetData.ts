import { useState } from 'react';
import { db } from '@/lib/db';

export function useResetData() {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = async () => {
    await db.delete();
    window.location.reload();
  };

  return {
    isOpen,
    setIsOpen,
    handleReset,
  };
}
