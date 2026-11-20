import { useEffect, useState } from "react";
import shared from "../../styles/shared.module.css";
import styles from "./Users.module.css";
import {
  deleteUser,
  getUsers,
  updateUserRole,
} from "../../services/userService";
import { UserForm } from "./UserForm";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import { useSortableData } from "../../hooks/useSortableData";
import type { User } from "../../types/user";

type UserSortColumn = "username" | "role";

export const Users = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const {
    sortedData,
    handleSort,
    sortIndicator,
  } = useSortableData<User, UserSortColumn>(
    users,
    {
      username: (a, b) =>
        a.username.localeCompare(b.username),

      role: (a, b) =>
        a.role.localeCompare(b.role),
    },
    "username",
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los usuarios.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleNewUser = () => {
    setShowForm(true);
  };

  const handleUserCreated = async () => {
    setShowForm(false);
    await loadUsers();
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleRoleChange = async (
    user: User,
    role: User["role"],
  ) => {
    if (role === user.role) {
      return;
    }

    try {
      setUpdatingRoleId(user.id);
      setError("");

      const updatedUser = await updateUserRole(user.id, role);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? updatedUser
            : currentUser,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el rol del usuario.",
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setDeletingId(userToDelete.id);
      setError("");

      await deleteUser(userToDelete.id);

      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      setUserToDelete(null);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el usuario.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    if (deletingId === null) {
      setUserToDelete(null);
    }
  };

  return (
    <main className={shared.mainContent}>
      <header className={shared.topbar}>
        <h1>Administración de Usuarios</h1>

        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={handleNewUser}
        >
          + Nuevo Usuario
        </button>
      </header>

      <section className={shared.card}>
        {loading && <p>Cargando usuarios...</p>}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>

            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              onClick={loadUsers}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay usuarios registrados.</p>
            <p>Creá el primer usuario para comenzar.</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className={styles.tableContainer}>
            <table className={`${styles.table} table-cards`}>
              <thead>
                <tr>
                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("username")}
                  >
                    Usuario{sortIndicator("username")}
                  </th>

                  <th
                    className={shared.sortable}
                    onClick={() => handleSort("role")}
                  >
                    Rol{sortIndicator("role")}
                  </th>

                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {sortedData.map((user) => {
                  const isUpdatingRole =
                    updatingRoleId === user.id;

                  const isDeleting =
                    deletingId === user.id;

                  const isCurrentUser =
                    user.username === currentUser?.username;

                  const isBusy =
                    isUpdatingRole || isDeleting;

                  return (
                    <tr key={user.id}>
                      <td data-label="Usuario">
                        {user.username}
                      </td>

                      <td data-label="Rol">
                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(
                              user,
                              event.target.value as User["role"],
                            )
                          }
                          disabled={isBusy || isCurrentUser}
                          className={styles.roleSelect}
                          aria-label={`Rol de ${user.username}`}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="OPERATOR">
                            OPERATOR
                          </option>
                        </select>
                      </td>

                      <td data-label="Acciones">
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                            disabled={
                              isBusy || isCurrentUser
                            }
                          >
                            {isDeleting
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
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
        <UserForm
          onSaved={handleUserCreated}
          onCancel={handleCancelForm}
        />
      )}

      {userToDelete && (
        <ConfirmModal
          title="Eliminar usuario"
          message={
            <>
              ¿Estás seguro de que querés eliminar a{" "}
              <strong>{userToDelete.username}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          loading={deletingId === userToDelete.id}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </main>
  );
};