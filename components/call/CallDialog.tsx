'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, PhoneCall, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TelnyxRTC } from '@telnyx/webrtc';
import { RegTokenObj } from '@/lib/regTokenObj';
import { TelnyxClientObj } from '@/lib/telnyxClientObj';
import { determineNewState, CallState } from '@/lib/determineNewState';

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
  const [callState, setCallState] = useState<CallState>({
    callState: 'ready',
    regToken: null
  });

  const [error, setError] = useState<string | null>(null);

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

  const handleButtonClick = () => {
    let newState = determineNewState(callState);
    if (newState.callState === 'connecting') {
      // Start call
      const formattedDestination = formatPhoneNumberForTelnyx(phoneNumber);
      const callerNumber = process.env.NEXT_PUBLIC_TELNYX_PHONE_NUMBER;
      
      console.log('Starting call to:', {
        original: phoneNumber,
        formatted: formattedDestination,
        callerNumber: callerNumber
      });
      
      if (!TelnyxClientObj.client) {
        console.error('WebRTC client not initialized');
        setError('WebRTC client not initialized');
        return;
      }

      try {
        TelnyxClientObj.currentCall = TelnyxClientObj.client.newCall({
          destinationNumber: formattedDestination,
          callerNumber: callerNumber,
          id: "2734978790240289927",
          
        });
        console.log('Call initiated:', TelnyxClientObj.currentCall);
      } catch (error) {
        console.error('Error initiating call:', error);
        setError('Failed to initiate call: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return;
      }
    } else if (newState.callState === 'ready') {
      // End call
      console.log('Ending call');
      TelnyxClientObj.clientInitiatedHangup = true;
      TelnyxClientObj.currentCall?.hangup();
    }
    setCallState(newState);
  };

  const handleHangup = () => {
    let newState = determineNewState(callState);
    setCallState(newState);
  };

  const generateToken = useCallback(async () => {
    if (!RegTokenObj.token) {
      try {
        console.log('Fetching token from API...');
        const response = await fetch('/api/telnyx/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Failed to get token');
        }

        const results = await response.json();
        console.log('Token API response:', results);
        
        if (!results.token) {
          throw new Error('No token received from API');
        }
        
        const token = results.token;
        RegTokenObj.token = token;
        setCallState({
          callState: callState.callState,
          regToken: token
        });
        
        console.log('Token successfully stored');
        return token;
      } catch (err) {
        console.error('Token generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate token');
        return null;
      }
    } else {
      return RegTokenObj.token;
    }
  }, [callState.callState]);

  const establishClient = useCallback((token: string) => {
    console.log('Establishing WebRTC client with token:', token.substring(0, 50) + '...');
    
    TelnyxClientObj.client = new TelnyxRTC({
      login_token: token
    });

    TelnyxClientObj.client
      .on('telnyx.ready', () => {
        console.log('WebRTC client ready to call');
      })
      .on('telnyx.socket.open', () => {
        console.log('WebRTC socket connected');
      })
      .on('telnyx.socket.close', () => {
        console.log('WebRTC socket disconnected');
      })
      .on('telnyx.error', (error: any) => {
        console.error('WebRTC error:', error);
        setError('WebRTC connection error: ' + error.message);
      })
      .on('telnyx.notification', (notification: any) => {
        console.log('WebRTC notification:', notification);
        
        if (notification.type === 'callUpdate') {
          console.log('Call update:', notification.call);
          if (notification.call.state === 'active') {
            TelnyxClientObj.clientInitiatedHangup = false;
            // Update state to connected without triggering handleButtonClick
            setCallState(prev => ({ ...prev, callState: 'connected' }));
          } else if (notification.call.state === 'hangup' && !TelnyxClientObj.clientInitiatedHangup) {
            // Update state to ready without triggering handleHangup
            setCallState(prev => ({ ...prev, callState: 'ready' }));
          }
        } else if (notification.type === 'userMediaError') {
          console.error('User media error:', notification.error);
          setError('Microphone access denied or unavailable');
        }
      });

    console.log('Connecting WebRTC client...');
    TelnyxClientObj.client.connect();
    
    setCallState({
      callState: callState.callState,
      regToken: callState.regToken
    });
  }, [callState.callState, callState.regToken]);

  const determineDisplay = () => {
    if (callState.callState === 'ready' && RegTokenObj.token) {
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
    } else if (callState.callState === 'connecting') {
      return <p className="text-center">Connecting you to {contactName || formatPhoneNumber(phoneNumber)}...</p>;
    } else if (callState.callState === 'connected') {
      return (
        <Button
          onClick={handleButtonClick}
          variant="destructive"
          className="flex items-center gap-2 px-8"
          size="lg"
        >
          <X className="h-4 w-4" />
          End Call
        </Button>
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

  // Initialize token and client when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initializeTokenAndClient = async () => {
        if (!RegTokenObj.token) {
          const token = await generateToken();
          if (token && !TelnyxClientObj.client) {
            establishClient(token);
          }
        } else if (!TelnyxClientObj.client) {
          establishClient(RegTokenObj.token);
        }
      };
      
      initializeTokenAndClient();
    }
  }, [isOpen, generateToken, establishClient]);

  const handleClose = () => {
    if (callState.callState === 'connected') {
      TelnyxClientObj.clientInitiatedHangup = true;
      TelnyxClientObj.currentCall?.hangup();
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
            {callState.callState === 'connected' && (
              <span>Call in progress</span>
            )}
            {callState.callState === 'ready' && (
              <span>Click Call to start your conversation</span>
            )}
          </div>

          {/* Audio element for call playback */}
          <audio id="remoteMedia" autoPlay />
        </div>
      </DialogContent>
    </Dialog>
  );
}