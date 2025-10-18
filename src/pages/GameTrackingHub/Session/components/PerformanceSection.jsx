import React from 'react';

/**
 * MiniChart - Performans verilerini gösteren mini grafik component'i
 */
function MiniChart({ data, color, max }) {
  // Basit bir mini chart implementasyonu
  if (!data || data.length === 0) {
    return <div className="mini-chart"><div>Veri yok</div></div>;
  }
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mini-chart">
      <svg width="100%" height="40" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
}

/**
 * PerformanceSection - Sistem performans verilerini gösteren component
 * FPS, CPU, GPU ve RAM kullanımını içerir
 */
function PerformanceSection({ 
  performanceTimeRange, 
  setPerformanceTimeRange, 
  performanceData, 
  performanceHistory 
}) {
  return (
    <div className="performance-section">
      <div className="performance-header">
        <h3>📊 System Performance</h3>
        <div className="time-range-selector">
          <button 
            className={`time-btn ${performanceTimeRange === '15m' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeRange('15m')}
          >
            15dk
          </button>
          <button 
            className={`time-btn ${performanceTimeRange === '1h' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeRange('1h')}
          >
            1sa
          </button>
          <button 
            className={`time-btn ${performanceTimeRange === 'session' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeRange('session')}
          >
            Session
          </button>
        </div>
      </div>
      <div className="performance-grid-large">
        <div className="perf-card-large fps-card">
          <div className="perf-card-header">
            <div className="perf-icon">🎮</div>
            <div className="perf-trend">
              <span className="trend-indicator positive">↗️ +2</span>
            </div>
          </div>
          <div className="perf-content">
            <h4>FPS</h4>
            <div className="perf-value-large">{performanceData?.fps || 0}</div>
            <div className="perf-status">Frames per Second</div>
            <MiniChart 
              data={performanceHistory?.[performanceTimeRange]?.fps || []} 
              color="#22c55e"
              max={120}
            />
          </div>
        </div>
        <div className="perf-card-large cpu-card">
          <div className="perf-card-header">
            <div className="perf-icon">🔧</div>
            <div className="perf-trend">
              <span className="trend-indicator neutral">→ 0</span>
            </div>
          </div>
          <div className="perf-content">
            <h4>CPU Usage</h4>
            <div className="perf-value-large">{performanceData?.cpuUsage || 0}%</div>
            <div className="perf-status">Processor Load</div>
            <MiniChart 
              data={performanceHistory?.[performanceTimeRange]?.cpu || []} 
              color="#3b82f6"
              max={100}
            />
          </div>
        </div>
        <div className="perf-card-large gpu-card">
          <div className="perf-card-header">
            <div className="perf-icon">🎨</div>
            <div className="perf-trend">
              <span className="trend-indicator negative">↘️ -3</span>
            </div>
          </div>
          <div className="perf-content">
            <h4>GPU Usage</h4>
            <div className="perf-value-large">{performanceData?.gpuUsage || 0}%</div>
            <div className="perf-status">Graphics Load</div>
            <MiniChart 
              data={performanceHistory?.[performanceTimeRange]?.gpu || []} 
              color="#8b5cf6"
              max={100}
            />
          </div>
        </div>
        <div className="perf-card-large ram-card">
          <div className="perf-card-header">
            <div className="perf-icon">💾</div>
            <div className="perf-trend">
              <span className="trend-indicator positive">↗️ +0.2</span>
            </div>
          </div>
          <div className="perf-content">
            <h4>RAM Usage</h4>
            <div className="perf-value-large">{(performanceData?.ramUsage || 0).toFixed(1)}GB</div>
            <div className="perf-status">Memory Usage</div>
            <MiniChart 
              data={performanceHistory?.[performanceTimeRange]?.ram || []} 
              color="#f59e0b"
              max={32}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceSection;
export { MiniChart };