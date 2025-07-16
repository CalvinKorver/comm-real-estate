'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneCall, X, AlertCircle, PhoneOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { callManager } from '@/lib/call-manager';
import { TelnyxCallState } from '@/lib/telnyx-client';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  contactName?: string;
  contactLabel?: string;
}

export function CallDialog({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  contactName, 
  contactLabel 
}: CallDialogProps) {
  const [callState, setCallState] = useState<TelnyxCallState>({
    status: 'idle'
  });

  const [error, setError] = useState<string | null>(null);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const [currentSession, setCurrentSession] = useState(callManager.getCurrentSession());
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  // Debug: log phone number details
  useEffect(() => {
    if (isOpen) {
      console.log('CallDialog opened with:', {
        phoneNumber,
        contactName,
        contactLabel,
        formattedPhone: formatPhoneNumber(phoneNumber)
      });
    }
  }, [isOpen, phoneNumber, contactName, contactLabel]);

  // Subscribe to call manager state changes
  useEffect(() => {
    const unsubscribeSession = callManager.onSessionChange((session) => {
      setCurrentSession(session);
    });

    const unsubscribeState = callManager.onStateChange((state) => {
      setCallState(state);
      
      // Auto-close dialog after call ends
      if (state.status === 'ended') {
        const timer = setTimeout(() => {
          onClose();
        }, 3000); // Auto-close after 3 seconds
        setAutoCloseTimer(timer);
      } else if (autoCloseTimer) {
        // Clear timer if state changes before auto-close
        clearTimeout(autoCloseTimer);
        setAutoCloseTimer(null);
      }
    });

    return () => {
      unsubscribeSession();
      unsubscribeState();
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer, onClose]);

  const handleButtonClick = async () => {
    if (callState.status === 'idle') {
      // Start call
      const formattedDestination = formatPhoneNumberForTelnyx(phoneNumber);
      
      console.log('Starting call to:', {
        original: phoneNumber,
        formatted: formattedDestination,
        contactName,
        contactLabel
      });
      
      try {
        setError(null);
        await callManager.startCall(formattedDestination, contactName, contactLabel);
      } catch (error) {
        console.error('Error initiating call:', error);
        setError('Failed to initiate call: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleHangup = async () => {
    if (isHangingUp) return;
    
    setIsHangingUp(true);
    setError(null);
    
    try {
      // Use the call manager to end the call
      callManager.endCall();
      
      // Also call the hangup API endpoint for server-side tracking
      if (currentSession && currentSession.callControlId) {
        const response = await fetch('/api/telnyx/hangup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callControlId: currentSession.callControlId,
            reason: 'client_initiated'
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to call hangup API:', await response.text());
          // Don't show error to user as the client-side hangup already happened
        }
      } else {
        console.warn('No call control ID available for hangup API call');
      }
      
    } catch (error) {
      console.error('Error during hangup:', error);
      setError('Failed to end call properly');
    } finally {
      setIsHangingUp(false);
    }
  };


  const determineDisplay = () => {
    if (callState.status === 'idle') {
      return (
        <Button
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-8"
          size="lg"
        >
          <PhoneCall className="h-4 w-4 text-green-600" />
          Call
        </Button>
      );
    } else if (callState.status === 'connecting') {
      return (
        <div className="space-y-4">
          <p className="text-center">Connecting you to {contactName || formatPhoneNumber(phoneNumber)}...</p>
          <Button
            onClick={handleHangup}
            variant="outline"
            className="flex items-center gap-2 px-6"
            size="sm"
            disabled={isHangingUp}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      );
    } else if (callState.status === 'connected') {
      return (
        <Button
          onClick={handleHangup}
          variant="destructive"
          className="flex items-center gap-2 px-8 bg-red-600 hover:bg-red-700"
          size="lg"
          disabled={isHangingUp}
        >
          <PhoneOff className="h-4 w-4" />
          {isHangingUp ? 'Hanging up...' : 'Hangup'}
        </Button>
      );
    } else if (callState.status === 'ringing') {
      return (
        <div className="space-y-4">
          <p className="text-center">Ringing {contactName || formatPhoneNumber(phoneNumber)}...</p>
          <Button
            onClick={handleHangup}
            variant="outline"
            className="flex items-center gap-2 px-6"
            size="sm"
            disabled={isHangingUp}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      );
    } else if (callState.status === 'ended') {
      return (
        <div className="space-y-4">
          <p className="text-center text-lg font-medium">Call Ended</p>
          <p className="text-center text-sm text-muted-foreground">
            This dialog will close automatically in 3 seconds
          </p>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center gap-2 px-6"
            size="sm"
          >
            <X className="h-4 w-4" />
            Close Now
          </Button>
        </div>
      );
    }
    return null;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatPhoneNumberForTelnyx = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phone;
    }
    return `+1${cleaned}`;
  };

  // Initialize the call manager when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initializeCallManager = async () => {
        try {
          if (!callManager.isConnected()) {
            await callManager.initializeClient();
          }
          
          // Reset call state to idle if there's no active call session
          if (!callManager.isCallInProgress()) {
            callManager.resetCallState();
            setError(null); // Clear any previous errors
          }
        } catch (error) {
          console.error('Failed to initialize call manager:', error);
          setError('Failed to initialize calling service');
        }
      };
      
      initializeCallManager();
    }
  }, [isOpen]);

  // Poll for call state updates when there's an active call
  useEffect(() => {
    if (!currentSession || !currentSession.callControlId || callState.status === 'idle') {
      return;
    }

    const pollCallStatus = async () => {
      try {
        const response = await fetch(`/api/telnyx/call-status?callControlId=${currentSession.callControlId}`);
        
        if (response.ok) {
          const statusData = await response.json();
          
          // If webhook indicates call was hung up by customer, update state
          if (statusData.status === 'hangup' && callState.status !== 'disconnected') {
            console.log('Customer hung up call, updating state');
            callManager.endCall();
          }
        } else if (response.status === 404) {
          // Call state not found - this is normal for early stages of call setup
          console.log('Call state not yet available in webhook system');
        }
      } catch (error) {
        console.error('Error polling call status:', error);
      }
    };

    const interval = setInterval(pollCallStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [currentSession, callState.status]);

  const handleClose = async () => {
    // Clear auto-close timer if it exists
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    if (callState.status === 'connected' || callState.status === 'connecting' || callState.status === 'ringing') {
      await handleHangup();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {contactName ? `Call ${contactName}` : 'Make Call'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-semibold">
              {formatPhoneNumber(phoneNumber)}
            </div>
            {contactLabel && (
              <div className="text-sm text-muted-foreground capitalize">
                {contactLabel.replace('_', ' ')}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            {determineDisplay()}
          </div>

          <div className="text-xs text-center text-muted-foreground">
            {callState.status === 'connected' && (
              <span>Call in progress</span>
            )}
            {callState.status === 'idle' && (
              <span>Click Call to start your conversation</span>
            )}
            {callState.status === 'connecting' && (
              <span>Initializing call...</span>
            )}
            {callState.status === 'ringing' && (
              <span>Ringing...</span>
            )}
            {callState.status === 'failed' && (
              <span>Call failed - please try again</span>
            )}
            {callState.status === 'ended' && (
              <span>Call ended</span>
            )}
          </div>

          {/* Audio element for call playback */}
          <audio id="remoteMedia" autoPlay />
        </div>
      </DialogContent>
    </Dialog>
  );
}