import { useEffect, useState } from "react";
import shared from "../../styles/shared.module.css";
import styles from "./Clients.module.css";
import {
  deleteClient,
  getClients,
} from "../../services/clientService";
import { ClientForm } from "./ClientForm";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import { useSortableData } from "../../hooks/useSortableData";
import type { Client } from "../../types/client";

type ClientSortColumn =
  | "name"
  | "taxId"
  | "email"
  | "phone";

export const Clients = () => {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] =
    useState<Client | null>(null);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [clientToDelete, setClientToDelete] =
    useState<Client | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const {
    sortedData,
    handleSort,
    sortIndicator,
  } = useSortableData<Client, ClientSortColumn>(
    clients,
    {
      name: (a, b) =>
        a.name.localeCompare(b.name),

      taxId: (a, b) =>
        (a.taxId || "").localeCompare(b.taxId || ""),

      email: (a, b) =>
        (a.email || "").localeCompare(b.email || ""),

      phone: (a, b) =>
        `${a.phoneCountryCode || ""}${a.phoneNumber || ""}`.localeCompare(
          `${b.phoneCountryCode || ""}${b.phoneNumber || ""}`,
        ),
    },
    "name",
  );

  const loadClients = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleNewClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleClientSaved = async () => {
    setShowForm(false);
    setEditingClient(null);
    await loadClients();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) {
      return;
    }

    try {
      setDeletingId(clientToDelete.id);
      setError("");

      await deleteClient(clientToDelete.id);

      setClientToDelete(null);
      await loadClients();
    } catch (err) {
      setClientToDelete(null);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el cliente.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    if (deletingId === null) {
      setClientToDelete(null);
    }
  };

  return (
    <main className={shared.mainContent}>
      <header className={shared.topbar}>
        <h1>Módulo de Clientes</h1>

        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={handleNewClient}
        >
          + Nuevo Cliente
        </button>
      </header>

      <section className={shared.card}>
        {loading && <p>Cargando clientes...</p>}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>

            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              onClick={loadClients}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay clientes registrados.</p>
            <p>Creá el primer cliente para comenzar.</p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className={styles.tableContainer}>
            <table className={`${styles.table} table-cards`}>
              <thead>
                <tr>
                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("name")}
                  >
                    Nombre{sortIndicator("name")}
                  </th>

                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("taxId")}
                  >
                    CUIT / DNI{sortIndicator("taxId")}
                  </th>

                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("email")}
                  >
                    Email{sortIndicator("email")}
                  </th>

                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("phone")}
                  >
                    Teléfono{sortIndicator("phone")}
                  </th>

                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {sortedData.map((client) => {
                  const isDeleting =
                    deletingId === client.id;

                  return (
                    <tr key={client.id}>
                      <td data-label="Nombre">
                        {client.name}
                      </td>

                      <td data-label="CUIT / DNI">
                        {client.taxId || "-"}
                      </td>

                      <td
                        data-label="Email"
                        className={styles.emailCell}
                      >
                        {client.email || "-"}
                      </td>

                      <td data-label="Teléfono">
                        {client.phoneNumber
                          ? `${client.phoneCountryCode || ""} ${client.phoneNumber}`.trim()
                          : "-"}
                      </td>

                      <td data-label="Acciones">
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() =>
                              handleEditClient(client)
                            }
                            disabled={isDeleting}
                          >
                            Editar
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={() =>
                                handleDeleteClient(client)
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
        <ClientForm
          client={editingClient ?? undefined}
          onSaved={handleClientSaved}
          onCancel={handleCancelForm}
        />
      )}

      {clientToDelete && (
        <ConfirmModal
          title="Eliminar cliente"
          message={
            <>
              ¿Estás seguro de que querés eliminar a{" "}
              <strong>{clientToDelete.name}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          loading={deletingId === clientToDelete.id}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </main>
  );
};