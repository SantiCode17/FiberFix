import { useEffect } from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

export function useKeepAwakeOnScreen() {
  useEffect(() => {
    activateKeepAwake();
    return () => {
      deactivateKeepAwake();
    };
  }, []);
}
