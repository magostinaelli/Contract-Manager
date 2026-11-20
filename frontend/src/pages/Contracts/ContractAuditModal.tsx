import type {
  AuditAction,
  Contract,
  ContractAuditLog,
  ContractStatus,
} from "../../types/contract";
import { getStatusLabel } from "../../utils/formatters";
import shared from "../../styles/shared.module.css";
import styles from "./ContractAuditModal.module.css";

interface ContractAuditModalProps {
  contract: Contract;
  logs: ContractAuditLog[];
  loading: boolean;
  error: string;
  onClose: () => void;
}

const auditActionLabels: Record<AuditAction, string> = {
  CREATED: "Contrato creado",
  UPDATED: "Contrato actualizado",
  STATUS_CHANGED: "Estado actualizado",
};

const formatAuditPerformer = (performedBy: string) => {
  return performedBy === "SYSTEM" ? "Sistema" : performedBy;
};

const formatAuditDetail = (log: ContractAuditLog) => {
  if (log.action !== "STATUS_CHANGED" || !log.detail) {
    return log.detail;
  }

  const [previousStatus, newStatus] = log.detail.split(" -> ");

  if (!previousStatus || !newStatus) {
    return log.detail;
  }

  return `${getStatusLabel(
    previousStatus as ContractStatus,
  )} → ${getStatusLabel(newStatus as ContractStatus)}`;
};

const formatAuditDate = (createdAt: string) => {
  return new Date(createdAt).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const ContractAuditModal = ({
  contract,
  logs,
  loading,
  error,
  onClose,
}: ContractAuditModalProps) => {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 id="audit-title">Historial del contrato</h2>
            <p>{contract.title}</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar historial"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {loading && (
            <p className={styles.message}>
              Cargando historial...
            </p>
          )}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <p className={styles.message}>
              Este contrato todavía no tiene movimientos
              registrados.
            </p>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className={styles.list}>
              {logs.map((log, index) => (
                <article
                  key={`${log.createdAt}-${log.action}-${index}`}
                  className={styles.item}
                >
                  <div className={styles.itemHeader}>
                    <strong>
                      {auditActionLabels[log.action]}
                    </strong>

                    <span>
                      {formatAuditDate(log.createdAt)}
                    </span>
                  </div>

                  <p className={styles.performer}>
                    {formatAuditPerformer(log.performedBy)}
                  </p>

                  {formatAuditDetail(log) && (
                    <p className={styles.detail}>
                      {formatAuditDetail(log)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={onClose}
            disabled={loading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};