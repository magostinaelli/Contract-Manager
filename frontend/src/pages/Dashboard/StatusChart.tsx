import type { ContractStatus } from '../../types/contract';
import { getStatusLabel } from '../../utils/formatters';
import styles from './Dashboard.module.css';

interface StatusChartProps {
  data: Record<ContractStatus, number>;
}

const statusOrder: ContractStatus[] = [
  'DRAFT',
  'ACTIVE',
  'EXPIRING_SOON',
  'EXPIRED',
  'UNDER_RENEWAL',
];

const statusColors: Record<ContractStatus, string> = {
  DRAFT: 'var(--color-info)',
  ACTIVE: 'var(--color-success)',
  EXPIRING_SOON: 'var(--color-warning)',
  EXPIRED: 'var(--color-danger)',
  UNDER_RENEWAL: 'var(--color-accent)',
};

export const StatusChart = ({ data }: StatusChartProps) => {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const total = statusOrder.reduce(
    (sum, status) => sum + data[status],
    0,
  );

  let accumulated = 0;

  return (
    <div className={styles.statusChartContent}>
      <div className={styles.donutWrapper}>
        <svg
          className={styles.donutChart}
          viewBox="0 0 180 180"
          role="img"
          aria-label={`Distribución de contratos por estado. Total: ${total}`}
        >
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            className={styles.donutTrack}
            strokeWidth="24"
          />

          {total > 0 &&
            statusOrder.map((status) => {
              const count = data[status];
              const segmentLength = (count / total) * circumference;
              const offset = accumulated;

              accumulated += segmentLength;

              if (count === 0) return null;

              return (
                <circle
                  key={status}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={statusColors[status]}
                  strokeWidth="24"
                  strokeDasharray={`${segmentLength} ${
                    circumference - segmentLength
                  }`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 90 90)"
                />
              );
            })}

          <text
            x="90"
            y="85"
            textAnchor="middle"
            className={styles.donutTotal}
          >
            {total}
          </text>

          <text
            x="90"
            y="105"
            textAnchor="middle"
            className={styles.donutCaption}
          >
            contratos
          </text>
        </svg>
      </div>

      <ul className={styles.statusLegend}>
        {statusOrder.map((status) => (
          <li key={status} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: statusColors[status] }}
              aria-hidden="true"
            />

            <span className={styles.legendLabel}>
              {getStatusLabel(status)}
            </span>

            <strong className={styles.legendCount}>
              {data[status]}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
};