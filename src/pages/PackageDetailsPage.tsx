import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { PageLoader } from "../components/Loader";
import { fetchPackageById, type TravelPackage } from "../services/packages";
import { addToWishlist } from "../services/wishlist";
import { createBooking } from "../services/bookings";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payments";
import { reviewService, type Review } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  MapPin,
  Clock,
  Star,
  Heart,
  Calendar,
  Users,
  Tag,
  ShieldCheck,
  Zap,
  Info,
  ChevronLeft,
  MessageSquare,
  Send,
  Edit3,
  Trash2,
  ArrowRight,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PackageDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImg, setActiveImg] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [processing, setProcessing] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const perPerson = useMemo(
    () => (pkg ? (pkg.discountPrice ?? pkg.price) : 0),
    [pkg],
  );
  const total = useMemo(() => perPerson * travelers, [perPerson, travelers]);

  useEffect(() => {
    let cancelled = false;
    console.log(error);

    async function run() {
      setLoading(true);
      try {
        if (!id) throw new Error("Package ID not found");
        const data = await fetchPackageById(id);
        if (!cancelled) setPkg(data);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.response?.data?.message || "Failed to load package.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();

    async function loadReviews() {
      if (!id) return;
      setReviewLoading(true);
      try {
        const data = await reviewService.getByPackage(id);
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setReviewLoading(false);
      }
    }
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    if (!travelDate) return toast.error("Please select travel date.");

    setProcessing(true);
    try {
      const booking = await createBooking({
        packageId: pkg._id,
        travelDate,
        numberOfTravelers: travelers,
        couponCode: couponCode || undefined,
      });

      const sdkOk = await loadRazorpayScript();
      if (!sdkOk) throw new Error("Razorpay SDK failed to load.");

      const order = await createRazorpayOrder(booking._id);
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Travelora",
        description: pkg.title,
        order_id: order.orderId,
        handler: async (response: any) => {
          await verifyRazorpayPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Booking confirmed! Redirecting...");
          setTimeout(() => navigate("/dashboard/bookings"), 1500);
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#6366f1" },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Checkout failed.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !user) return toast.error("Login required.");
    if (!newReview.comment) return toast.error("Please add a comment.");

    setProcessing(true);
    try {
      if (editingReviewId) {
        const updated = await reviewService.update(
          id,
          editingReviewId,
          newReview,
        );
        setReviews((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r)),
        );
        toast.success("Review updated!");
        setEditingReviewId(null);
      } else {
        const created = await reviewService.create(id, newReview);
        setReviews((prev) => [created, ...prev]);
        toast.success("Thank you for your review!");
      }
      setNewReview({ rating: 5, comment: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Review failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <Sidebar>
        <PageLoader />
      </Sidebar>
    );
  if (!pkg)
    return (
      <Sidebar>
        <div className="auth-error">Package not found.</div>
      </Sidebar>
    );

  return (
    <Sidebar>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 8,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <div className="topbar-title">{pkg.title}</div>
            <div className="topbar-sub">
              Experience the magic of {pkg.destination}
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left: Gallery & Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="content-card"
              style={{ padding: 0, overflow: "hidden", borderRadius: 24 }}
            >
              <div style={{ position: "relative", height: 400 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: pkg.images?.[activeImg]?.url
                        ? `url(${pkg.images[activeImg].url}) center/cover`
                        : "linear-gradient(135deg,#6366f1,#06b6d4)",
                    }}
                  />
                </AnimatePresence>

                {/* Thumbnails */}
                {pkg.images && pkg.images.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 10,
                      background: "rgba(0,0,0,0.3)",
                      padding: "8px 12px",
                      borderRadius: 16,
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {pkg.images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setActiveImg(idx)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 8,
                          cursor: "pointer",
                          border:
                            activeImg === idx
                              ? "2px solid #fff"
                              : "2px solid transparent",
                          background: `url(${img.url}) center/cover`,
                          transition: "border 0.2s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: "rgba(99,102,241,0.1)",
                        color: "var(--primary-light)",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      <Tag
                        size={12}
                        style={{ verticalAlign: "middle", marginRight: 4 }}
                      />{" "}
                      {pkg.category}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#fbbf24",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      <Star size={16} fill="#fbbf24" />{" "}
                      {pkg.rating?.toFixed(1) || "N/A"}
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                        }}
                      >
                        ({reviews.length} reviews)
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      try {
                        await addToWishlist(pkg._id);
                        toast.success("Added to wishlist!");
                      } catch {
                        toast.error("Could not add to wishlist");
                      }
                    }}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      padding: "8px 16px",
                      borderRadius: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                    }}
                  >
                    <Heart size={18} fill="currentColor" /> Wishlist
                  </motion.button>
                </div>

                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    marginBottom: 12,
                    color: "var(--text-primary)",
                  }}
                >
                  {pkg.title}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 20,
                    marginBottom: 24,
                    padding: "16px 0",
                    borderTop: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <MapPin
                      size={18}
                      style={{ color: "var(--primary-light)" }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        Destination
                      </div>
                      <div style={{ fontWeight: 600 }}>{pkg.destination}</div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Clock size={18} style={{ color: "var(--secondary)" }} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        Duration
                      </div>
                      <div style={{ fontWeight: 600 }}>{pkg.duration} Days</div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Users size={18} style={{ color: "var(--accent)" }} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        Capacity
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        Up to {pkg.seats || 20} persons
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    fontSize: "1rem",
                  }}
                >
                  <h3
                    style={{
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      fontWeight: 800,
                    }}
                  >
                    About this package
                  </h3>
                  {pkg.description ||
                    "No detailed description available for this package."}
                </div>

                {/* Features Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginTop: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 16,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        Safe & Secure
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Verified professional guides
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 16,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(6, 182, 212, 0.1)",
                        color: "#06b6d4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Zap size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        Instant Confirmation
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Get your tickets instantly
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews */}
            <div className="content-card" style={{ borderRadius: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2 style={{ fontWeight: 900, marginBottom: 4 }}>
                    Traveler Experiences
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    What people are saying about this journey.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: "var(--primary-light)",
                    }}
                  >
                    {pkg.rating?.toFixed(1) || "0.0"}
                  </div>
                  <Stars rating={pkg.rating} />
                </div>
              </div>

              {user ? (
                <div
                  style={{
                    marginBottom: 32,
                    padding: 20,
                    borderRadius: 20,
                    background: "rgba(99,102,241,0.04)",
                    border: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Edit3 size={16} />{" "}
                    {editingReviewId ? "Edit your review" : "Share your story"}
                  </h4>
                  <form onSubmit={handleReviewSubmit}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Rating</label>
                        <select
                          style={{
                            padding: "10px 32px 10px 14px",
                            backgroundColor: "#1e1b4b",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            appearance: "none",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            width: "100%",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                            backgroundSize: "14px",
                            outline: "none",
                          }}
                          value={newReview.rating}
                          onChange={(e) =>
                            setNewReview((r) => ({
                              ...r,
                              rating: Number(e.target.value),
                            }))
                          }
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} Stars {"⭐".repeat(n)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comment</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Tell us about the sights, the guides, and your overall experience..."
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview((r) => ({
                            ...r,
                            comment: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: "auto", padding: "12px 24px" }}
                      >
                        <Send size={16} style={{ marginRight: 8 }} />{" "}
                        {editingReviewId ? "Update Review" : "Post Review"}
                      </motion.button>
                      {editingReviewId && (
                        <button
                          type="button"
                          className="pkg-details-btn"
                          style={{
                            padding: "0 20px",
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                          }}
                          onClick={() => setEditingReviewId(null)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed var(--border)",
                    marginBottom: 24,
                  }}
                >
                  <Info
                    size={32}
                    style={{ color: "var(--text-secondary)", marginBottom: 12 }}
                  />
                  <p>Want to share your experience? Login to post a review.</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-primary"
                    style={{
                      width: "auto",
                      marginTop: 16,
                      padding: "10px 24px",
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {reviewLoading ? (
                  <div
                    className="skeleton"
                    style={{ height: 100, width: "100%" }}
                  />
                ) : (
                  reviews.map((rev) => (
                    <motion.div
                      layout
                      key={rev._id}
                      style={{
                        padding: 20,
                        borderRadius: 20,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.01)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #6366f1, #06b6d4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {rev.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {rev.user?.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {new Date(rev.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                        <Stars rating={rev.rating} />
                      </div>
                      <p
                        style={{
                          lineHeight: 1.6,
                          color: "var(--text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {rev.comment}
                      </p>

                      {user?.id === rev.user?._id && (
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          <button
                            onClick={() => {
                              setNewReview({
                                rating: rev.rating,
                                comment: rev.comment,
                              });
                              setEditingReviewId(rev._id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary-light)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Delete?")) {
                                await reviewService.delete(pkg._id, rev._id);
                                setReviews((r) =>
                                  r.filter((x) => x._id !== rev._id),
                                );
                                toast.success("Deleted");
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
                {!reviewLoading && reviews.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-secondary)",
                      padding: 40,
                    }}
                  >
                    <MessageSquare
                      size={32}
                      style={{ opacity: 0.3, marginBottom: 12 }}
                    />
                    <p>No stories yet. Be the first to share!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="content-card"
            style={{
              position: "sticky",
              top: 100,
              borderRadius: 24,
              padding: "28px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontWeight: 900, marginBottom: 4 }}>
                Book Your Trip
              </h2>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Reserve your spot in just a few clicks.
              </p>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 20,
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.1)",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Price per person
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "1.4rem",
                    color: "var(--primary-light)",
                  }}
                >
                  ₹{Number(perPerson).toLocaleString("en-IN")}
                </span>
              </div>
              {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{Number(pkg.price).toLocaleString("en-IN")}
                </div>
              )}
            </div>

            <form
              onSubmit={handlePay}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label
                  className="form-label"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Calendar size={14} /> Travel Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ borderRadius: 12 }}
                  min={new Date().toISOString().split("T")[0]}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label
                  className="form-label"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Users size={14} /> Number of Travelers
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-input"
                    style={{
                      textAlign: "center",
                      borderRadius: 12,
                      fontWeight: 700,
                    }}
                    min={1}
                    value={travelers}
                    onChange={(e) =>
                      setTravelers(Math.max(1, Number(e.target.value)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => t + 1)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Coupon Code</label>
                <input
                  className="form-input"
                  style={{ borderRadius: 12 }}
                  placeholder="E.g. EXPLORE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>

              <div
                style={{
                  padding: "20px 0",
                  borderTop: "1px solid var(--border)",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Total Amount</span>
                  <span style={{ fontWeight: 900, fontSize: "1.5rem" }}>
                    ₹{Number(total).toLocaleString("en-IN")}
                  </span>
                </div>
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(99,102,241,0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary"
                  disabled={processing}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    fontSize: "1.1rem",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                  }}
                >
                  {processing ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      Confirm & Pay{" "}
                      <ArrowRight size={20} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                marginTop: 12,
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
              }}
            >
              <ShieldCheck size={14} /> 100% Secure Payment via Razorpay
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .Stars { display: flex; gap: 2; }
      `}</style>
    </Sidebar>
  );
}

function Stars({ rating }: { rating?: number }) {
  const r = Math.round(rating ?? 0);
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          fill={i <= r ? "#f59e0b" : "none"}
          stroke={i <= r ? "#f59e0b" : "#475569"}
        />
      ))}
    </div>
  );
}
