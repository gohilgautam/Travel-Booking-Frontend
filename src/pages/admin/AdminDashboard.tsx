import { useState, useEffect } from "react";
import { AdminSidebar } from "../../components/Sidebar";
import api from "../../services/api";
import { motion } from "framer-motion";
import { PageLoader } from "../../components/Loader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, Package, CalendarCheck, IndianRupee } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalPackages: number;
  totalRevenue: number;
  recentBookings: Array<{
    _id: string;
    user?: { name: string; email: string };
    package?: { title: string; destination: string };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topPackages: Array<{
    title: string;
    emoji?: string;
    count: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    bookings: number;
  }>;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(error);

    api
      .get("/admin/dashboard")
      .then((r) => setStats(r.data?.data))
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  const chartData =
    stats?.monthlyRevenue.map((m) => ({
      name: MONTHS[m._id.month - 1],
      revenue: Math.round(m.revenue / 1000),
      bookings: m.bookings,
    })) ?? [];

  const statusColor = (s: string) => {
    if (s === "confirmed" || s === "completed")
      return { bg: "rgba(16,185,129,0.15)", color: "#34d399" };
    if (s === "pending")
      return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" };
    return { bg: "rgba(239,68,68,0.15)", color: "#f87171" };
  };

  const glassCard: React.CSSProperties = {
    background: "rgba(20, 20, 40, 0.45)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    color: "#fff",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <AdminSidebar>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100%",
          padding: "32px 40px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(to right, #fff, #a5b4fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Command Center
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              marginTop: 4,
            }}
          >
            Global platform analytics & real-time monitoring
          </p>
        </motion.div>

        {loading && <PageLoader />}

        {stats && (
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            {/* STATS ROW */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 24,
              }}
            >
              {[
                {
                  icon: Users,
                  label: "Active Users",
                  value: stats.totalUsers,
                  color: "#6366f1",
                },
                {
                  icon: Package,
                  label: "Live Packages",
                  value: stats.totalPackages,
                  color: "#06b6d4",
                },
                {
                  icon: CalendarCheck,
                  label: "Total Bookings",
                  value: stats.totalBookings,
                  color: "#10b981",
                },
                {
                  icon: IndianRupee,
                  label: "Revenue (INR)",
                  value: "₹" + (stats.totalRevenue / 100000).toFixed(1) + "L",
                  color: "#f59e0b",
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  style={glassCard}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 12px 40px 0 ${s.color}33`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          marginTop: 8,
                          color: "#fff",
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                    <div
                      style={{
                        background: `${s.color}22`,
                        padding: 12,
                        borderRadius: 16,
                        color: s.color,
                      }}
                    >
                      <s.icon size={28} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${s.color}, transparent)`,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* CHARTS ROW */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 24,
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={glassCard}
              >
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    margin: "0 0 20px 0",
                  }}
                >
                  Revenue Trajectory
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.4)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 15, 25, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={glassCard}
              >
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    margin: "0 0 20px 0",
                  }}
                >
                  Top Destinations
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topPackages.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        stroke="rgba(255,255,255,0.4)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={100}
                        stroke="rgba(255,255,255,0.8)"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          v.length > 12 ? v.substring(0, 12) + "..." : v
                        }
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{
                          background: "rgba(15, 15, 25, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* RECENT BOOKINGS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={glassCard}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  Live Transactions
                </h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 12px #10b981",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Real-time feed
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <th style={{ padding: "16px 8px", fontWeight: 600 }}>
                        USER
                      </th>
                      <th style={{ padding: "16px 8px", fontWeight: 600 }}>
                        DESTINATION
                      </th>
                      <th style={{ padding: "16px 8px", fontWeight: 600 }}>
                        AMOUNT
                      </th>
                      <th style={{ padding: "16px 8px", fontWeight: 600 }}>
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b, i) => {
                      const sc = statusColor(b.status);
                      return (
                        <motion.tr
                          key={b._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <td style={{ padding: "16px 8px" }}>
                            <div style={{ fontWeight: 600 }}>
                              {b.user?.name ?? "Unknown User"}
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {b.user?.email ?? "—"}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "16px 8px",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            {b.package?.title ?? "—"}
                          </td>
                          <td
                            style={{
                              padding: "16px 8px",
                              fontWeight: 700,
                              color: "#f8fafc",
                            }}
                          >
                            ₹{b.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "16px 8px" }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: sc.bg,
                                color: sc.color,
                                border: `1px solid ${sc.color}40`,
                              }}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <style>{`
                @keyframes pulse {
                  0% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.2); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}</style>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
