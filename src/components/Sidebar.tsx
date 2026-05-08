import { Link, useLocation, useNavigate } from "react-router-dom";
import { type ReactNode, useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import PageBackground from "./PageBackground";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck,
  CreditCard,
  Tags,
  Star,
  Ticket,
  Bell,
  ShieldAlert,
  Map,
  Heart,
  User,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import logo from "../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png";

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Package, label: "Packages", path: "/admin/packages" },
  { icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Tags, label: "Categories", path: "/admin/categories" },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
  { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: User, label: "My Profile", path: "/admin/profile" },
  {
    icon: ShieldAlert,
    label: "Admins",
    path: "/admin/admins",
    superAdminOnly: true,
  },
];

const userNav = [
  { icon: Map, label: "Packages", path: "/dashboard" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: CalendarCheck, label: "My Bookings", path: "/dashboard/bookings" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

const NavItem = ({
  item,
  isActive,
  collapsed,
}: {
  item: any;
  isActive: boolean;
  collapsed: boolean;
}) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      style={{
        textDecoration: "none",
        position: "relative",
        display: "block",
        padding: collapsed ? "0 12px" : "0 16px",
        marginBottom: "4px",
      }}
    >
      <motion.div
        whileHover={{
          x: collapsed ? 0 : 4,
          background: "rgba(255, 255, 255, 0.05)",
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? "0" : "14px",
          padding: "12px",
          borderRadius: "14px",
          position: "relative",
          overflow: "hidden",
          color: isActive
            ? "var(--sidebar-text-active)"
            : "var(--sidebar-text)",
          transition: "all 0.3s ease",
          fontWeight: isActive ? 600 : 500,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav-bg"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--bg-card-hover)",
              border: "1px solid var(--sidebar-border)",
              borderRadius: "14px",
              zIndex: 0,
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: collapsed ? "0" : "14px",
          }}
        >
          <Icon
            size={20}
            style={{
              color: isActive ? "#818cf8" : "currentColor",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ fontSize: "0.95rem", whiteSpace: "nowrap" }}
            >
              {item.label}
            </motion.span>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

// Custom hook for responsive behavior
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export function AdminSidebar({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("sidebar_collapsed") === "true",
  );

  useEffect(() => {
    sessionStorage.setItem("sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  // Track recent items (store only paths)
  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("recent_admin_paths");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const currentItem = adminNav.find((n) => isActive(n.path));
    if (currentItem) {
      setRecentPaths((prev) => {
        const next = [
          currentItem.path,
          ...prev.filter((p) => p !== currentItem.path),
        ].slice(0, 3);
        sessionStorage.setItem("recent_admin_paths", JSON.stringify(next));
        return next;
      });
    }
  }, [location.pathname]);

  const recentItems = useMemo(
    () =>
      recentPaths
        .map((path) => adminNav.find((n) => n.path === path))
        .filter(Boolean),
    [recentPaths],
  );

  return (
    <div
      className="app-layout"
      style={{ display: "flex", minHeight: "100vh", background: "var(--layout-bg)" }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "64px",
            background: "var(--topbar-bg)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            zIndex: 90,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
            />
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
              Travelora
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobile && mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 95,
          }}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isMobile
            ? mobileMenuOpen
              ? SIDEBAR_WIDTH
              : 0
            : collapsed
              ? SIDEBAR_COLLAPSED_WIDTH
              : SIDEBAR_WIDTH,
          x: isMobile && !mobileMenuOpen ? -SIDEBAR_WIDTH : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          background: "var(--sidebar-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: "10px 0 30px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "var(--text-primary)",
                }}
              >
                Travelora
              </span>
            </motion.div>
          )}
          {collapsed && (
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          )}

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: collapsed ? "absolute" : "relative",
                right: collapsed ? "-12px" : "0",
                top: collapsed ? "40px" : "0",
                zIndex: 101,
                boxShadow: "var(--shadow)",
              }}
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          )}
        </div>

        <div
          style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}
          className="custom-scrollbar"
        >
          {!collapsed && (
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "20px 24px 8px",
              }}
            >
              Workspace
            </div>
          )}

          <nav>
            {adminNav
              .filter(
                (item) => !item.superAdminOnly || user?.role === "superadmin",
              )
              .map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive(item.path)}
                  collapsed={collapsed}
                />
              ))}
          </nav>

          {!collapsed && recentItems.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  padding: "24px 24px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Clock size={12} /> Recent
              </div>
              {recentItems.map((item) => (
                <NavItem
                  key={"recent-" + item!.path}
                  item={item}
                  isActive={isActive(item!.path)}
                  collapsed={collapsed}
                />
              ))}
            </motion.div>
          )}

          {!collapsed && (
            <div style={{ padding: "24px 16px 16px" }}>
              <motion.button
                whileHover={{ x: 4, background: "rgba(255, 255, 255, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/dashboard")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                <ExternalLink size={18} /> User Portal
              </motion.button>
            </div>
          )}
        </div>

        <SidebarFooter logout={logout} user={user} collapsed={collapsed} />
      </motion.aside>

      <motion.main
        animate={{
          marginLeft: isMobile
            ? 0
            : collapsed
              ? SIDEBAR_COLLAPSED_WIDTH
              : SIDEBAR_WIDTH,
          paddingTop: isMobile ? "64px" : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ flex: 1, position: "relative" }}
      >
        <PageBackground />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </motion.main>
    </div>
  );
}

export default function Sidebar({ children }: { children?: ReactNode }) {
  return (
    <div
      className="app-layout"
      style={{ 
        display: "flex", 
        flexDirection: "column",
        minHeight: "100vh", 
        background: "var(--layout-bg)",
        position: "relative"
      }}
    >
      <PageBackground />
      
      {/* Navbar for User Panel */}
      <Navbar />

      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          flex: 1, 
          position: "relative", 
          zIndex: 1,
          paddingTop: "100px", // space for navbar
          paddingBottom: "40px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "0 40px" }}>
          {children}
        </div>
      </motion.main>
    </div>
  );
}

function SidebarFooter({
  user,
  logout,
  collapsed,
}: {
  user: any;
  logout: () => void;
  collapsed: boolean;
}) {
  return (
    <div
      style={{
        padding: collapsed ? "20px 10px" : "20px 24px",
        borderTop: "1px solid var(--border)",
        background: "var(--sidebar-footer-bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: collapsed ? "10px" : "12px",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: "1rem",
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Guest User"}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                textTransform: "capitalize",
              }}
            >
              {user?.role || "user"}
            </div>
          </motion.div>
        )}
        {!collapsed && (
          <motion.button
            whileHover={{
              scale: 1.1,
              color: "#ef4444",
              background: "rgba(239, 68, 68, 0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "8px",
              borderRadius: "10px",
            }}
          >
            <LogOut size={18} />
          </motion.button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={logout}
          style={{
            width: "100%",
            marginTop: "10px",
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} />
        </button>
      )}
    </div>
  );
}
