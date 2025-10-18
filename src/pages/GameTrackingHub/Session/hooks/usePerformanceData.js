import { useState, useEffect, useRef } from 'react';

/**
 * usePerformanceData - Sistem performans verilerini yönetmek için custom hook
 * FPS, CPU, GPU, RAM verilerini simüle eder ve geçmişini tutar
 */
function usePerformanceData() {
  const [performanceData, setPerformanceData] = useState({
    fps: 60,
    cpuUsage: 45,
    gpuUsage: 67,
    ramUsage: 8.2
  });

  const [performanceTimeRange, setPerformanceTimeRange] = useState('15m');
  
  const [performanceHistory, setPerformanceHistory] = useState({
    '15m': {
      fps: Array.from({ length: 15 }, () => Math.floor(Math.random() * 60) + 30),
      cpu: Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 20),
      gpu: Array.from({ length: 15 }, () => Math.floor(Math.random() * 40) + 40),
      ram: Array.from({ length: 15 }, () => Math.random() * 4 + 6)
    },
    '1h': {
      fps: Array.from({ length: 60 }, () => Math.floor(Math.random() * 60) + 30),
      cpu: Array.from({ length: 60 }, () => Math.floor(Math.random() * 50) + 20),
      gpu: Array.from({ length: 60 }, () => Math.floor(Math.random() * 40) + 40),
      ram: Array.from({ length: 60 }, () => Math.random() * 4 + 6)
    },
    'session': {
      fps: Array.from({ length: 120 }, () => Math.floor(Math.random() * 60) + 30),
      cpu: Array.from({ length: 120 }, () => Math.floor(Math.random() * 50) + 20),
      gpu: Array.from({ length: 120 }, () => Math.floor(Math.random() * 40) + 40),
      ram: Array.from({ length: 120 }, () => Math.random() * 4 + 6)
    }
  });

  const performanceIntervalRef = useRef(null);

  // Performans verilerini güncelle
  const updatePerformanceData = () => {
    setPerformanceData(prev => ({
      fps: Math.max(30, Math.min(120, prev.fps + (Math.random() - 0.5) * 10)),
      cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 8)),
      gpuUsage: Math.max(20, Math.min(95, prev.gpuUsage + (Math.random() - 0.5) * 12)),
      ramUsage: Math.max(4, Math.min(16, prev.ramUsage + (Math.random() - 0.5) * 0.5))
    }));

    // Geçmişe yeni veri ekle
    setPerformanceHistory(prev => {
      const newHistory = { ...prev };
      
      Object.keys(newHistory).forEach(timeRange => {
        newHistory[timeRange] = {
          fps: [...newHistory[timeRange].fps.slice(1), performanceData.fps],
          cpu: [...newHistory[timeRange].cpu.slice(1), performanceData.cpuUsage],
          gpu: [...newHistory[timeRange].gpu.slice(1), performanceData.gpuUsage],
          ram: [...newHistory[timeRange].ram.slice(1), performanceData.ramUsage]
        };
      });
      
      return newHistory;
    });
  };

  // Performans izlemeyi başlat
  const startPerformanceMonitoring = () => {
    if (!performanceIntervalRef.current) {
      performanceIntervalRef.current = setInterval(updatePerformanceData, 2000);
    }
  };

  // Performans izlemeyi durdur
  const stopPerformanceMonitoring = () => {
    if (performanceIntervalRef.current) {
      clearInterval(performanceIntervalRef.current);
      performanceIntervalRef.current = null;
    }
  };

  // Component mount olduğunda performans izlemeyi başlat
  useEffect(() => {
    startPerformanceMonitoring();
    
    return () => {
      stopPerformanceMonitoring();
    };
  }, []);

  return {
    performanceData,
    performanceTimeRange,
    setPerformanceTimeRange,
    performanceHistory,
    startPerformanceMonitoring,
    stopPerformanceMonitoring
  };
}

export default usePerformanceData;