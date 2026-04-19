import React, { useState } from 'react';
import { 
  Droplets, 
  Wind, 
  Settings, 
  RefreshCw,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { useRealtimeData } from '../hooks/useRealtimeData';
import stations from '../config/stations.json';
import mapping from '../config/display_mapping.json';

const Dashboard: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [targetTime, setTargetTime] = useState(new Date());
  const [selectedVar, setSelectedVar] = useState('water_level');

  const { data, latest, loading, error, checkQC } = useRealtimeData(selectedStation.table, targetTime);

  if (loading && data.length === 0) return <div className="loading-screen">데이터 로드 중...</div>;
  if (error) return <div className="error-screen">오류 발생: {error}</div>;

  const chartData = [...data].reverse()
    .filter(item => item && item.observed_at)
    .map(item => {
      try {
        const dateStr = String(item.observed_at);
        // "2026-04-19 19:20:00+00" -> "2026-04-19T19:20:00" 강제 변환
        const safeIsoStr = dateStr.slice(0, 10) + 'T' + dateStr.slice(11, 19);
        const date = new Date(safeIsoStr);
        if (isNaN(date.getTime())) return null;
        return {
          time: format(date, 'MM/dd HH:mm'),
          value: item[selectedVar],
        };
      } catch (e) {
        console.error('Date parsing error:', e);
        return null;
      }
    })
    .filter((d): d is { time: string; value: any } => d !== null);

  const allValues = chartData.map(d => d.value).filter(v => v !== null && !isNaN(v));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || 0.1;

  const handleRefresh = () => {
    setTargetTime(new Date());
  };

  const formatDisplayValue = (val: number) => {
    if (selectedVar.includes('v_') || selectedVar.includes('velocity')) {
      return val.toFixed(3);
    }
    return val.toFixed(1);
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {/* 상단 컨트롤 섹션 */}
      <section className="controls-section glass-card">
        <div className="control-group">
          <MapPin size={18} className="text-primary" />
          <select 
            value={selectedStation.id} 
            onChange={(e) => {
              const station = stations.find(s => s.id === e.target.value);
              if (station) setSelectedStation(station);
            }}
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <Clock size={18} className="text-primary" />
          <input 
            type="datetime-local" 
            value={format(targetTime, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => setTargetTime(new Date(e.target.value))}
          />
        </div>
      </section>

      {/* 헤더 섹션 */}
      <header className="main-header">
        <div className="station-info">
          <div className="title-row">
            <h1>{selectedStation.name}</h1>
            <button className="monitoring-btn" onClick={handleRefresh}>
              <RefreshCw size={14} /> 모니터링
            </button>
          </div>
          <p className="latest-ts">
            {latest?.observed_at ? (() => {
              try {
                const dateStr = String(latest.observed_at);
                const safeIsoStr = dateStr.slice(0, 10) + 'T' + dateStr.slice(11, 19);
                const date = new Date(safeIsoStr);
                return isNaN(date.getTime()) ? '데이터 형식 오류' : `최근 관측: ${format(date, 'yyyy-MM-dd HH:mm')}`;
              } catch (e) {
                return '데이터 오류';
              }
            })() : '데이터 없음'}
          </p>
        </div>
      </header>

      {/* 주요 지표 그리드 - 고정된 높이 유지 */}
      <section className="stats-grid high-grid">
        <StatGroupCard 
          icon={<Droplets size={22} />} 
          config={mapping.water}
          data={latest}
          checkQC={checkQC}
          groupKey="water"
        />
        <StatGroupCard 
          icon={<Wind size={22} />} 
          config={mapping.velocity}
          data={latest}
          checkQC={checkQC}
          groupKey="velocity"
        />
        <StatGroupCard 
          icon={<Zap size={22} />} 
          config={mapping.power}
          data={latest}
          checkQC={checkQC}
          groupKey="power"
        />
        <StatGroupCard 
          icon={<Settings size={22} />} 
          config={mapping.etc}
          data={latest}
          checkQC={checkQC}
          groupKey="etc"
        />
      </section>

      {/* 차트 섹션 */}
      <section className="chart-section glass-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <TrendingUp size={20} className="text-primary" />
            <h2>시계열 데이터(24시간)</h2>
          </div>
          <select 
            className="var-selector"
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
          >
            {[
              { key: 'water_level', label: '수위' },
              { key: 'water_depth', label: '수심' },
              { key: 'temp_water_1', label: '수온' },
              { key: 'dc_battery', label: '배터리' },
              { key: 'v_calculated_1', label: '유속계(1번)' },
              { key: 'v_calculated_2', label: '유속계(2번)' },
              { key: 'v_surface', label: '표면유속' }
            ].map(v => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </div>
        
        <div className="chart-wrapper" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d1ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d1ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={true} 
                axisLine={false}
                angle={-60}
                textAnchor="end"
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={[minVal - padding, maxVal + padding]}
                tickFormatter={formatDisplayValue}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1b1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#00d1ff' }}
                formatter={(val: any) => [formatDisplayValue(Number(val)), '값']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00d1ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 하단 탭 네비게이션 */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={handleRefresh}>
          <Activity size={24} />
          <span>현재</span>
        </button>
        <button className="nav-item">
          <Wind size={24} />
          <span>분석</span>
        </button>
        <button className="nav-item">
          <Droplets size={24} />
          <span>수질</span>
        </button>
      </nav>
    </div>
  );
};

interface StatGroupCardProps {
  icon: React.ReactNode;
  config: any;
  data: any;
  checkQC: (key: string, value: number) => string;
  groupKey: string;
}

const StatGroupCard: React.FC<StatGroupCardProps> = ({ icon, config, data, checkQC, groupKey }) => {
  const formatValue = (_: string, val: any) => {
    if (val === undefined || val === null) return '--';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    
    if (groupKey === 'water') return num.toFixed(2);
    if (groupKey === 'velocity') return num.toFixed(3);
    if (groupKey === 'power' || groupKey === 'etc') return num.toFixed(1);
    
    return num.toFixed(2);
  };

  return (
    <div className="stat-group-card horizontal-layout glass-card">
      <div className="group-header">
        <div className="group-icon">{icon}</div>
        <span className="group-title">{config.title}</span>
      </div>
      <div className="group-items-row">
        {config.items.map((item: any, idx: number) => (
          <div key={idx} className="group-cell">
            <span className="cell-label">{item.label}</span>
            <div className="cell-value-group">
              <span className={`cell-value ${checkQC(item.key, data?.[item.key])}`}>
                {formatValue(item.key, data?.[item.key])}
              </span>
              <span className="cell-unit">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
