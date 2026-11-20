import { useEffect, useState } from "react";
import shared from "../../styles/shared.module.css";
import styles from "./Contracts.module.css";
import {
  deleteContract,
  getContractAudit,
  getContracts,
} from "../../services/contractService";
import type { Contract, ContractAuditLog } from "../../types/contract";
import { ContractForm } from "./ContractForm";
import { ContractAuditModal } from "./ContractAuditModal";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import { useSortableData } from "../../hooks/useSortableData";
import { getBadgeClass, getStatusLabel } from "../../utils/formatters";
import { ContractAttachments } from "./ContractAttachments";

type ContractSortColumn =
  | "title"
  | "client"
  | "startDate"
  | "endDate"
  | "amount"
  | "status";

export const Contracts = () => {
  const { user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] =
    useState<Contract | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [contractToDelete, setContractToDelete] =
    useState<Contract | null>(null);
  const [attachmentsContract, setAttachmentsContract] =
    useState<Contract | null>(null);

  const [auditContract, setAuditContract] =
    useState<Contract | null>(null);
  const [auditLogs, setAuditLogs] =
    useState<ContractAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const {
    sortedData,
    handleSort,
    sortIndicator,
  } = useSortableData<Contract, ContractSortColumn>(
    contracts,
    {
      title: (a, b) =>
        a.title.localeCompare(b.title),

      client: (a, b) =>
        (a.client?.name || a.clientName || "").localeCompare(
          b.client?.name || b.clientName || "",
        ),

      startDate: (a, b) =>
        (a.startDate || "").localeCompare(
          b.startDate || "",
        ),

      endDate: (a, b) =>
        a.endDate.localeCompare(b.endDate),

      amount: (a, b) =>
        a.amount - b.amount,

      status: (a, b) =>
        a.status.localeCompare(b.status),
    },
    "endDate",
  );

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getContracts();
      setContracts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los contratos.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleNewContract = () => {
    setEditingContract(null);
    setShowForm(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleViewAudit = async (contract: Contract) => {
    try {
      setAuditContract(contract);
      setAuditLogs([]);
      setAuditError("");
      setAuditLoading(true);

      const data = await getContractAudit(contract.id);
      setAuditLogs(data);
    } catch (err) {
      setAuditError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el historial del contrato.",
      );
    } finally {
      setAuditLoading(false);
    }
  };

  const handleCloseAudit = () => {
    if (auditLoading) {
      return;
    }

    setAuditContract(null);
    setAuditLogs([]);
    setAuditError("");
  };

  const handleContractSaved = async () => {
    setShowForm(false);
    setEditingContract(null);
    await loadContracts();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContract(null);
  };

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) {
      return;
    }

    try {
      setDeletingId(contractToDelete.id);
      setError("");

      await deleteContract(contractToDelete.id);

      setContractToDelete(null);
      await loadContracts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el contrato.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    if (deletingId === null) {
      setContractToDelete(null);
    }
  };

  return (
    <main className={shared.mainContent}>
      <header className={shared.topbar}>
        <h1>Módulo de Contratos</h1>

        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={handleNewContract}
        >
          + Nuevo Contrato
        </button>
      </header>

      <section className={shared.card}>
        {loading && <p>Cargando contratos...</p>}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>

            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              onClick={loadContracts}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          contracts.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay contratos registrados.</p>
              <p>
                Creá el primer contrato para comenzar.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          contracts.length > 0 && (
            <div className={styles.tableContainer}>
              <table
                className={`${styles.table} table-cards`}
              >
                <thead>
                  <tr>
                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("title")}
                    >
                      Título{sortIndicator("title")}
                    </th>

                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("client")}
                    >
                      Cliente{sortIndicator("client")}
                    </th>

                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("startDate")}
                    >
                      Inicio{sortIndicator("startDate")}
                    </th>

                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("endDate")}
                    >
                      Fin{sortIndicator("endDate")}
                    </th>

                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("amount")}
                    >
                      Monto{sortIndicator("amount")}
                    </th>

                    <th
                      className={shared.sortable}
                      onClick={() => handleSort("status")}
                    >
                      Estado{sortIndicator("status")}
                    </th>

                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.map((contract) => {
                    const isDeleting =
                      deletingId === contract.id;

                    return (
                      <tr key={contract.id}>
                        <td data-label="Título">
                          {contract.title}
                        </td>

                        <td data-label="Cliente">
                          {contract.client?.name ||
                            contract.clientName ||
                            "-"}
                        </td>

                        <td data-label="Inicio">
                          {contract.startDate || "-"}
                        </td>

                        <td data-label="Fin">
                          {contract.endDate || "-"}
                        </td>

                        <td data-label="Monto">
                          {contract.amount != null
                            ? contract.amount.toLocaleString(
                                "es-AR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )
                            : "-"}
                        </td>

                        <td data-label="Estado">
                          <span
                            className={getBadgeClass(
                              contract.status,
                            )}
                          >
                            {getStatusLabel(
                              contract.status,
                            )}
                          </span>
                        </td>

                        <td data-label="Acciones">
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() =>
                                handleEditContract(contract)
                              }
                              disabled={isDeleting}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className={styles.historyButton}
                              onClick={() =>
                                handleViewAudit(contract)
                              }
                              disabled={isDeleting}
                            >
                              Historial
                            </button>

                            <button
                              type="button"
                              className={styles.historyButton}
                              onClick={() =>
                                setAttachmentsContract(contract)
                              }
                              disabled={isDeleting}
                            >
                              Adjuntos
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() =>
                                  handleDeleteContract(contract)
                                }
                                disabled={isDeleting}
                              >
                                {isDeleting
                                  ? "Eliminando..."
                                  : "Eliminar"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </section>

      {showForm && (
        <ContractForm
          contract={editingContract ?? undefined}
          onSaved={handleContractSaved}
          onCancel={handleCancelForm}
        />
      )}

      {contractToDelete && (
        <ConfirmModal
          title="Eliminar contrato"
          message={
            <>
              ¿Estás seguro de que querés eliminar el
              contrato{" "}
              <strong>{contractToDelete.title}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          loading={
            deletingId === contractToDelete.id
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {auditContract && (
        <ContractAuditModal
          contract={auditContract}
          logs={auditLogs}
          loading={auditLoading}
          error={auditError}
          onClose={handleCloseAudit}
        />
      )}

      {attachmentsContract && (
        <ContractAttachments
          contractId={attachmentsContract.id}
          contractTitle={attachmentsContract.title}
          onClose={() => setAttachmentsContract(null)}
        />
      )}
    </main>
  );
};