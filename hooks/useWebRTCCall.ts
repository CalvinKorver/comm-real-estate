import { useState, useEffect, useCallback } from 'react';
import { callManager, CallSession } from '@/lib/call-manager';
import { TelnyxCallState } from '@/lib/telnyx-client';

export interface UseWebRTCCallReturn {
  currentSession: CallSession | null;
  callState: TelnyxCallState;
  isInitialized: boolean;
  isConnecting: boolean;
  isCallInProgress: boolean;
  error: string | null;
  startCall: (phoneNumber: string, contactName?: string, contactLabel?: string) => Promise<void>;
  endCall: () => void;
  initialize: () => Promise<void>;
}

export function useWebRTCCall(): UseWebRTCCallReturn {
  const [currentSession, setCurrentSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<TelnyxCallState>({ status: 'idle' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeSession = callManager.onSessionChange((session) => {
      setCurrentSession(session);
    });

    const unsubscribeState = callManager.onStateChange((state) => {
      setCallState(state);
    });

    return () => {
      unsubscribeSession();
      unsubscribeState();
    };
  }, []);

  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      setIsConnecting(true);
      setError(null);
      await callManager.initializeClient();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize WebRTC client';
      setError(errorMessage);
      console.error('WebRTC initialization error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isInitialized]);

  const startCall = useCallback(async (
    phoneNumber: string, 
    contactName?: string, 
    contactLabel?: string
  ) => {
    try {
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }

      const formattedNumber = callManager.formatPhoneNumber(phoneNumber);
      await callManager.startCall(formattedNumber, contactName, contactLabel);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      console.error('Call start error:', err);
      throw err;
    }
  }, [isInitialized, initialize]);

  const endCall = useCallback(() => {
    try {
      setError(null);
      callManager.endCall();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end call';
      setError(errorMessage);
      console.error('Call end error:', err);
    }
  }, []);

  const isCallInProgress = currentSession !== null;

  return {
    currentSession,
    callState,
    isInitialized,
    isConnecting,
    isCallInProgress,
    error,
    startCall,
    endCall,
    initialize,
  };
}