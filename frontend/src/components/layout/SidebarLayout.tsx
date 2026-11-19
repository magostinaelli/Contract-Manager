import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./SidebarLayout.module.css";

export function SidebarLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img
            src="/src/assets/images/legalTechLogo.png"
            alt="LegalTech"
            className={styles.logo}
          />

          <span className={styles.badgeRole}>
            {user?.role ?? "USUARIO"}
          </span>
        </div>

        <nav className={styles.navMenu}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/contracts"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            Contratos
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            Clientes
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className={styles.themeToggleContainer}>
          {user && <p className={styles.userName}>{user.username}</p>}
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeButton}
            aria-label="Cambiar tema"
          >
            {theme === "light" ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={styles.themeButton}
            aria-label="Cerrar sesión"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}