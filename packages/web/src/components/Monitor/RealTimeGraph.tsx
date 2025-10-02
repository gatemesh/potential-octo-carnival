import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface RealTimeGraphProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
  maxPoints?: number;
  height?: number;
}

export function RealTimeGraph({
  data,
  title,
  unit,
  color = '#3b82f6',
  maxPoints = 50,
  height = 300,
}: RealTimeGraphProps) {
  const chartData = useMemo(() => {
    // Limit data points and format for recharts
    const limitedData = data.slice(-maxPoints);
    return limitedData.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value,
      timestamp: point.timestamp,
    }));
  }, [data, maxPoints]);

  const formatTooltip = (value: any, name: any) => {
    if (name === 'value') {
      return [`${value} ${unit}`, title];
    }
    return [value, name];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              fontSize={12}
              tick={{ fontSize: 10 }}
              label={{ value: unit, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Last {chartData.length} data points • Updates in real-time
      </div>
    </div>
  );
}