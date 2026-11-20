import { useState } from "react";
import { createUser } from "../../services/userService";
import type { ApiError } from "../../services/apiClient";
import type { User } from "../../types/user";
import type { UserCreateRequest } from "../../types/userCreateRequest";
import styles from "./UserForm.module.css";

interface UserFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export const UserForm = ({
  onSaved,
  onCancel,
}: UserFormProps) => {
  const [formData, setFormData] =
    useState<UserCreateRequest>({
      username: "",
      password: "",
      role: "OPERATOR",
    });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === "role"
          ? (value as User["role"])
          : value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const username = formData.username.trim();

    if (!username) {
      setError("El usuario es obligatorio.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});

      const data: UserCreateRequest = {
        username,
        password: formData.password,
        role: formData.role,
      };

      await createUser(data);

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
            : "No se pudo crear el usuario.",
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
        aria-labelledby="user-form-title"
      >
        <header className={styles.header}>
          <h2 id="user-form-title">
            Nuevo Usuario
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

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label htmlFor="username">
              Usuario *
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />

            {fieldErrors.username && (
              <p
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">
              Contraseña *
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />

            {fieldErrors.password && (
              <p
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="role">
              Rol *
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="OPERATOR">
                OPERATOR
              </option>

              <option value="ADMIN">
                ADMIN
              </option>
            </select>

            {fieldErrors.role && (
              <p
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.role}
              </p>
            )}
          </div>

          {error && (
            <p
              className={styles.error}
              role="alert"
            >
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
                ? "Creando..."
                : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};