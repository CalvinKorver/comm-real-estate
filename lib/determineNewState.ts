// Simple state machine logic like the example
export interface CallState {
  callState: 'ready' | 'connecting' | 'connected';
  regToken: string | null;
}

export function determineNewState(currentState: CallState): CallState {
  if (currentState.callState === 'ready') {
    return { 
      callState: 'connecting',
      regToken: currentState.regToken
    };
  } else if (currentState.callState === 'connecting') {
    return { 
      callState: 'connected',
      regToken: currentState.regToken
    };
  } else if (currentState.callState === 'connected') {
    return { 
      callState: 'ready',
      regToken: currentState.regToken
    };
  }
  return currentState;
}