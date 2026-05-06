import { useState, useEffect } from "react";
import { AdminSidebar } from "../../components/Sidebar";
import {
  notificationService,
  type Notification,
} from "../../services/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Users,
  Mail,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { PageLoader } from "../../components/Loader";

export default function AdminNotifications() {
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<"all" | "users">("all");
  const [type, _] = useState("announcement");

  const loadHistory = async () => {
    try {
      const data = await notificationService.getAll();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return toast.error("Please fill in all fields");

    setSending(true);
    try {
      await notificationService.send({ subject, body, type, recipients });
      toast.success("Notification broadcasted successfully");
      setSubject("");
      setBody("");
      loadHistory();
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <AdminSidebar>
      <div className="topbar">
        <div>
          <div className="topbar-title">🔔 Notifications</div>
          <div className="topbar-sub">
            Broadcast messages and manage communication history.
          </div>
        </div>
      </div>

      <div
        className="page-body"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Composer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="content-card"
          style={{ position: "sticky", top: 24 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(99,102,241,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-light)",
              }}
            >
              <Send size={20} />
            </div>
            <h3 style={{ margin: 0, fontWeight: 700 }}>New Broadcast</h3>
          </div>

          <form
            onSubmit={handleSend}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div className="form-group">
              <label className="form-label">Recipients</label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setRecipients("all")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background:
                      recipients === "all"
                        ? "rgba(99,102,241,0.1)"
                        : "transparent",
                    color:
                      recipients === "all"
                        ? "var(--primary-light)"
                        : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Users size={16} /> All
                </button>
                <button
                  type="button"
                  onClick={() => setRecipients("users")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background:
                      recipients === "users"
                        ? "rgba(99,102,241,0.1)"
                        : "transparent",
                    color:
                      recipients === "users"
                        ? "var(--primary-light)"
                        : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Mail size={16} /> Users Only
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                placeholder="e.g. Exclusive Summer Offer!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Content</label>
              <textarea
                className="form-input"
                rows={6}
                style={{ resize: "none" }}
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={sending}
              style={{ padding: "14px", borderRadius: 14, marginTop: 10 }}
            >
              {sending ? "Broadcasting..." : "Send Notification"}
            </button>
          </form>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="content-card"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(99,102,241,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-light)",
                }}
              >
                <History size={20} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Broadcast History</h3>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.05)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {history.length} Sent
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {history.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: 20,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.subject}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.75rem",
                        color: item.status === "sent" ? "#34d399" : "#f87171",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.status === "sent" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {item.status}
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.body}
                  </p>
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>By {item.sentBy?.name || "Admin"}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {history.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "var(--text-secondary)",
                }}
              >
                <Bell size={40} style={{ opacity: 0.1, marginBottom: 16 }} />
                <div>No notifications sent yet.</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminSidebar>
  );
}
