'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CallDialog } from './CallDialog';
import { useUserAuthorization } from '@/hooks/useUserAuthorization';

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
  const { isAuthorized, isLoading } = useUserAuthorization();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthorized) {
      setIsDialogOpen(true);
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      // disabled={!isAuthorized || isLoading}
      className={`flex items-center gap-1 ${
        !isAuthorized ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Phone className="h-3 w-3" />
      {children || 'Call'}
    </Button>
  );

  if (!isAuthorized && !isLoading) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice calling feature is not available yet</p>
          </TooltipContent>
        </Tooltip>
        
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

  return (
    <>
      {buttonContent}
      
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