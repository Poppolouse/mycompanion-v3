import { useState, useEffect, useRef } from 'react';

/**
 * useSessionTimer - Session timer yönetimi için custom hook
 * Timer başlatma, durdurma, duraklatma işlevlerini sağlar
 */
function useSessionTimer() {
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const intervalRef = useRef(null);

  // Timer'ı başlat
  const startSession = () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
      setSessionStartTime(new Date());
      
      intervalRef.current = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  // Timer'ı durdur
  const stopSession = () => {
    setIsSessionActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Session'ı sıfırla
    setSessionTime(0);
    setSessionStartTime(null);
  };

  // Timer'ı duraklat/devam ettir
  const pauseSession = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsSessionActive(true);
      intervalRef.current = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  // Zamanı formatla (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Component unmount olduğunda interval'ı temizle
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sessionTime,
    isSessionActive,
    sessionStartTime,
    startSession,
    stopSession,
    pauseSession,
    formatTime
  };
}

export default useSessionTimer;