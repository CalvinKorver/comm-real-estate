'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CallDialog } from './CallDialog';

interface CallButtonProps {
  phoneNumber: string;
  contactName?: string;
  contactLabel?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function CallButton({
  phoneNumber,
  contactName,
  contactLabel,
  variant = 'outline',
  size = 'sm',
  children,
}: CallButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className="flex items-center gap-1"
      >
        <Phone className="h-3 w-3" />
        {children || 'Call'}
      </Button>
      
      <CallDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        phoneNumber={phoneNumber}
        contactName={contactName}
        contactLabel={contactLabel}
      />
    </>
  );
}