import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, Heart, CalendarCheck, User, LogOut, 
  Menu, X, Bell, ShieldAlert, ChevronDown, Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import logo from "../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png";

const userNav = [
  { icon: Map, label: "Explore", path: "/dashboard" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: CalendarCheck, label: "My Bookings", path: "/dashboard/bookings" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Phone, label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "64px",
        background: isScrolled ? "var(--topbar-bg)" : "rgba(25, 20, 35, 0.35)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(10px)",
          border: `1px solid ${isScrolled ? "var(--border)" : "rgba(255, 255, 255, 0.1)"}`,
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: isScrolled ? "var(--shadow)" : "none",
        }}
      >
        {/* Logo */}
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", overflow: "hidden" }}>
            <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Travelora
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ alignItems: "center", gap: "8px", display: "none" }} className="desktop-nav">
          {userNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "12px",
                    color: active ? "var(--primary)" : "var(--text-secondary)",
                    background: active ? "rgba(245, 158, 11, 0.1)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "8px",
              position: "relative"
            }}
          >
            <Bell size={20} />
            <span style={{
              position: "absolute", top: 6, right: 6, width: "8px", height: "8px",
              background: "var(--primary)", borderRadius: "50%", border: "2px solid var(--bg-dark)"
            }} />
          </motion.button>

          <div style={{ position: "relative" }}>
            <motion.div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "4px 4px 4px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", display: "none" }} className="user-name-label">
                {user?.name?.split(' ')[0]}
              </span>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.85rem"
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </motion.div>

            <AnimatePresence>
              {userDropdownOpen && (
                <>
                  <div 
                    style={{ position: "fixed", inset: 0, zIndex: -1 }} 
                    onClick={() => setUserDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      width: "220px",
                      background: "var(--bg-card)",
                      backdropFilter: "blur(30px)",
                      border: "1px solid var(--border)",
                      borderRadius: "20px",
                      padding: "8px",
                      boxShadow: "var(--shadow)",
                      zIndex: 1001
                    }}
                  >
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <Link to="/admin" style={{ textDecoration: "none" }}>
                        <div className="nav-dropdown-item admin-link">
                          <ShieldAlert size={18} /> Admin Panel
                        </div>
                      </Link>
                    )}
                    <Link to="/profile" style={{ textDecoration: "none" }}>
                      <div className="nav-dropdown-item">
                        <User size={18} /> My Profile
                      </div>
                    </Link>
                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 8px" }} />
                    <div className="nav-dropdown-item logout" onClick={logout}>
                      <LogOut size={18} /> Sign Out
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
              display: "none"
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "90px",
              left: "24px",
              right: "24px",
              background: "var(--bg-card)",
              backdropFilter: "blur(30px)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 999,
              boxShadow: "var(--shadow)"
            }}
          >
            {userNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "14px 20px",
                      borderRadius: "16px",
                      color: active ? "var(--primary)" : "var(--text-secondary)",
                      background: active ? "rgba(245, 158, 11, 0.1)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .user-name-label { display: block !important; }
        }
        @media (max-width: 1023px) {
          .mobile-toggle { display: block !important; }
        }
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-dropdown-item:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .nav-dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .nav-dropdown-item.admin-link {
          color: var(--primary);
        }
      `}</style>
    </nav>
  );
}
