import { useState, useEffect } from 'react';
import {
  getDashboardData,
  getRecentContracts,
} from '../../services/dashboardService';
import type {
  Contract,
  DashboardData,
} from '../../types/contract';
import {
  formatCurrency,
  formatDate,
  getBadgeClass,
  getStatusLabel,
} from '../../utils/formatters';
import { ExpirationChart } from './ExpirationChart';
import { StatusChart } from './StatusChart';
import styles from './Dashboard.module.css';
import shared from '../../styles/shared.module.css';

const initialDashboardData: DashboardData = {
  totalActiveContracts: 0,
  expiringSoonCount: 0,
  totalCommittedAmount: 0,
  contractsByStatus: {
    DRAFT: 0,
    ACTIVE: 0,
    EXPIRING_SOON: 0,
    EXPIRED: 0,
    UNDER_RENEWAL: 0,
  },
  monthlyExpirations: [],
};

export const Dashboard = () => {
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(initialDashboardData);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [dashboardResponse, contractsData] = await Promise.all([
          getDashboardData(),
          getRecentContracts(),
        ]);

        setDashboardData(dashboardResponse);
        setContracts(contractsData);
      } catch {
        setError('Error al comunicar con el servidor backend');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <main className={shared.mainContent}>
      <header className={shared.topbar}>
        <h1>Dashboard</h1>
      </header>

      {error && <div className={styles.alertError}>{error}</div>}

      <section className={styles.metricsGrid}>
        <div className={`${shared.card} ${styles.metricCard}`}>
          <span className={styles.metricTitle}>CONTRATOS ACTIVOS</span>
          <span className={styles.metricValue}>
            {isLoading ? '...' : dashboardData.totalActiveContracts}
          </span>
        </div>

        <div className={`${shared.card} ${styles.metricCard}`}>
          <span className={styles.metricTitle}>PRÓXIMOS A VENCER</span>
          <span className={`${styles.metricValue} ${styles.textWarning}`}>
            {isLoading ? '...' : dashboardData.expiringSoonCount}
          </span>
        </div>

        <div className={`${shared.card} ${styles.metricCard}`}>
          <span className={styles.metricTitle}>MONTO TOTAL</span>
          <span className={styles.metricValue}>
            {isLoading
              ? '...'
              : formatCurrency(dashboardData.totalCommittedAmount)}
          </span>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        <article className={`${shared.card} ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Vencimientos por mes</h3>
          <p className={styles.chartDescription}>
            Cantidad de contratos que vencen en cada mes
          </p>

          {isLoading ? (
            <p className={styles.chartEmpty}>Cargando datos...</p>
          ) : (
            <ExpirationChart data={dashboardData.monthlyExpirations} />
          )}
        </article>

        <article className={`${shared.card} ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Contratos por estado</h3>
          <p className={styles.chartDescription}>
            Distribución de los contratos registrados
          </p>

          {isLoading ? (
            <p className={styles.chartEmpty}>Cargando datos...</p>
          ) : (
            <StatusChart data={dashboardData.contractsByStatus} />
          )}
        </article>
      </section>

      <section className={shared.card}>
        <h3 className={styles.tableTitle}>Contratos Recientes</h3>

        <div className={styles.tableWrapper}>
          <table className={`${styles.dataTable} table-cards`}>
            <thead>
              <tr>
                <th>TÍTULO</th>
                <th>CLIENTE</th>
                <th>VENCIMIENTO</th>
                <th>MONTO</th>
                <th>ESTADO</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className={styles.tableEmpty}>
                    Cargando datos del servidor...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.tableEmpty}>
                    No hay contratos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                contracts.slice(0, 5).map((contract) => (
                  <tr key={contract.id}>
                    <td data-label="Título">{contract.title}</td>
                    <td data-label="Cliente">{contract.clientName}</td>
                    <td data-label="Vencimiento">
                      {formatDate(contract.endDate)}
                    </td>
                    <td data-label="Monto">
                      {formatCurrency(contract.amount)}
                    </td>
                    <td data-label="Estado">
                      <span className={getBadgeClass(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};