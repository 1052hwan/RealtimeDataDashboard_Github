import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, subHours } from 'date-fns';
import mapping from '../config/display_mapping.json';

const MR = mapping as any;

export function useRealtimeData(tableName: string, targetTime: Date = new Date()) {
  const [data, setData] = useState<any[]>([]);
  const [latest, setLatest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processItem = (item: any) => {
    const processed = { ...item };
    
    // water_data의 v_ew_1_x, v_ns_1_x 등을 기반으로 유속 계산
    const ew1_values = [];
    for (let i = 3; i <= 15; i++) {
      if (item[`v_ew_1_${i}`] !== undefined) ew1_values.push(item[`v_ew_1_${i}`]);
    }
    const med_ew1 = calculateMedian(ew1_values);
    processed.v_calculated_1 = parseFloat((med_ew1 * 0.001).toFixed(4));

    const ew2_values = [];
    for (let i = 5; i <= 20; i++) {
      if (item[`v_ew_2_${i}`] !== undefined) ew2_values.push(item[`v_ew_2_${i}`]);
    }
    const med_ew2 = calculateMedian(ew2_values);
    processed.v_calculated_2 = parseFloat((med_ew2 * 0.001).toFixed(4));
    
    processed.v_surface = parseFloat(((processed.v_calculated_1 + processed.v_calculated_2) / 2).toFixed(4));

    // 기타 필드에 scale 적용
    Object.keys(MR).forEach(groupKey => {
      const group = MR[groupKey];
      if (group && group.items) {
        group.items.forEach((conf: any) => {
          if (conf.scale && processed[conf.key] !== undefined && !conf.key.startsWith('v_')) {
            processed[conf.key] = parseFloat((processed[conf.key] * conf.scale).toFixed(4));
          }
        });
      }
    });

    return processed;
  };

  const calculateMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const end = targetTime;
      const start = subHours(end, 24);

      const { data: initialData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .gte('observed_at', format(start, "yyyy-MM-dd'T'HH:mm:ss") + '+00')
        .lte('observed_at', format(end, "yyyy-MM-dd'T'HH:mm:ss") + '+00')
        .order('observed_at', { ascending: false });

      if (fetchError) throw fetchError;

      const processed = (initialData || []).map(processItem);
      setData(processed);
      setLatest(processed[0] || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const isNearNow = Math.abs(new Date().getTime() - targetTime.getTime()) < 1000 * 60 * 10;
    let subscription: any;

    if (isNearNow) {
      subscription = supabase
        .channel(`${tableName}_realtime`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: tableName },
          (payload) => {
            const newItem = processItem(payload.new);
            setData((prev) => [newItem, ...prev].sort((a, b) => 
              new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
            ).slice(0, 200));
            setLatest(newItem);
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [tableName, targetTime]);

  return { 
    data, 
    latest, 
    loading, 
    error,
    checkQC: (key: string, value: number) => {
      const config = MR[key];
      if (config && (value < config.min || value > config.max)) return 'error';
      return 'normal';
    },
    refresh: fetchData 
  };
}
