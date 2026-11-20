import { useEffect, useState } from "react";
import {
  createContract,
  updateContract,
} from "../../services/contractService";
import { getClients } from "../../services/clientService";
import type { Contract } from "../../types/contract";
import type { Client } from "../../types/client";
import type { ContractRequest } from "../../types/contractRequest";
import styles from "./ContractForm.module.css";

interface ContractFormProps {
  contract?: Contract;
  onSaved: () => void;
  onCancel: () => void;
}

export const ContractForm = ({
  contract,
  onSaved,
  onCancel,
}: ContractFormProps) => {
  const isEditing = Boolean(contract);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [formData, setFormData] = useState<ContractRequest>({
    title: contract?.title ?? "",
    clientId: contract?.client?.id ?? 0,
    startDate: contract?.startDate ?? "",
    endDate: contract?.endDate ?? "",
    amount: contract?.amount ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        setError("");

        const data = await getClients();
        setClients(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los clientes.",
        );
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "clientId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!formData.clientId) {
      setError("El cliente es obligatorio.");
      return;
    }

    if (!formData.startDate) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }

    if (!formData.endDate) {
      setError("La fecha de fin es obligatoria.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError(
        "La fecha de fin no puede ser anterior a la fecha de inicio.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data: ContractRequest = {
        title: formData.title.trim(),
        clientId: formData.clientId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: Number(formData.amount) || 0,
      };

      if (contract) {
        await updateContract(contract.id, data);
      } else {
        await createContract(data);
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "No se pudo actualizar el contrato."
            : "No se pudo crear el contrato.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onCancel();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-form-title"
      >
        <header className={styles.header}>
          <h2 id="contract-form-title">
            {isEditing ? "Editar Contrato" : "Nuevo Contrato"}
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            disabled={saving}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="clientId">Cliente *</label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              disabled={loadingClients || saving}
              required
            >
              <option value={0} disabled>
                {loadingClients
                  ? "Cargando clientes..."
                  : "Seleccionar cliente"}
              </option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="startDate">Fecha de inicio *</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="endDate">Fecha de fin *</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="amount">Monto</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving || loadingClients}
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};