import type { MonthlyExpiration } from '../../types/contract';
import styles from './Dashboard.module.css';

interface ExpirationChartProps {
  data: MonthlyExpiration[];
}

const formatMonth = (value: string): string => {
  const [year, month] = value.split('-').map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return value;
  }

  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  return `${months[month - 1]} ${year}`;
};

export const ExpirationChart = ({ data }: ExpirationChartProps) => {
  const chartWidth = 600;
  const chartHeight = 260;
  const left = 42;
  const right = 16;
  const top = 24;
  const bottom = 52;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const maxValue = Math.max(1, ...data.map((item) => item.count));
  const slotWidth = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(42, slotWidth * 0.52);

  if (data.length === 0) {
    return (
      <p className={styles.chartEmpty}>
        No hay datos de vencimientos disponibles.
      </p>
    );
  }

  return (
    <div className={styles.chartContent}>
      <svg
        className={styles.barChart}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Cantidad de contratos que vencen por mes"
      >
        {[0, 1, 2, 3, 4].map((step) => {
          const value = Math.ceil((maxValue * step) / 4);
          const y = top + plotHeight - (plotHeight * step) / 4;

          return (
            <g key={step}>
              <line
                x1={left}
                y1={y}
                x2={chartWidth - right}
                y2={y}
                className={styles.chartGridLine}
              />
              <text
                x={left - 10}
                y={y + 4}
                textAnchor="end"
                className={styles.chartAxisLabel}
              >
                {value}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const barHeight = (item.count / maxValue) * plotHeight;
          const x =
            left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = top + plotHeight - barHeight;
          const labelX = left + index * slotWidth + slotWidth / 2;

          return (
            <g key={item.month}>
              {item.count > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className={styles.chartBar}
                />
              )}

              <text
                x={labelX}
                y={
                  item.count > 0
                    ? Math.max(top + 12, y - 8)
                    : top + plotHeight - 8
                }
                textAnchor="middle"
                className={styles.chartValue}
              >
                {item.count}
              </text>

              <text
                x={labelX}
                y={chartHeight - 24}
                textAnchor="middle"
                className={styles.chartAxisLabel}
              >
                {formatMonth(item.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};