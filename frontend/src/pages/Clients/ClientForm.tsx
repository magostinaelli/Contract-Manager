import { useState } from "react";
import { createClient, updateClient } from "../../services/clientService";
import type { ClientRequest } from "../../types/clientRequest";
import styles from "./ClientForm.module.css";
import type { Client } from "../../types/client";
import { countryCodes } from "../../constants/countries";
import type { ApiError } from "../../services/apiClient";

interface ClientFormProps {
  client?: Client;
  onSaved: () => void;
  onCancel: () => void;
}

export const ClientForm = ({ client, onSaved, onCancel }: ClientFormProps) => {
  const isEditing = Boolean(client);

  const [formData, setFormData] = useState<ClientRequest>({
    name: client?.name ?? "",
    taxId: client?.taxId ?? "",
    email: client?.email ?? "",
    phoneCountryCode: client?.phoneCountryCode ?? "+54",
    phoneNumber: client?.phoneNumber ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});

      const data: ClientRequest = {
        name: formData.name.trim(),
        taxId: formData.taxId?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phoneCountryCode: formData.phoneNumber?.trim()
          ? formData.phoneCountryCode
          : undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
      };

      if (client) {
        await updateClient(client.id, data);
      } else {
        await createClient(data);
      }

      onSaved();
    } catch (err) {
      setFieldErrors({});

      const apiError = err as Error & Partial<ApiError>;

      if (apiError.fieldErrors) {
        setFieldErrors(apiError.fieldErrors);
        setError("");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : isEditing
              ? "No se pudo actualizar el cliente."
              : "No se pudo crear el cliente.",
        );
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-form-title"
      >
        <header className={styles.header}>
          <h2 id="client-form-title">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Nombre *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="taxId">CUIT / DNI</label>
            <input
              id="taxId"
              name="taxId"
              type="text"
              value={formData.taxId}
              onChange={handleChange}
            />
            {fieldErrors.taxId && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.taxId}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phoneNumber">Teléfono</label>

            <div className={styles.phoneFields}>
              <select
                id="phoneCountryCode"
                name="phoneCountryCode"
                value={formData.phoneCountryCode}
                onChange={handleChange}
                aria-label="Código de país"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>

              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="1144556677"
                inputMode="numeric"
              />
            </div>
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
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
