import { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

const ARC_DATA = [
  {
    startLat: 40.7128,
    startLng: -74.006,
    endLat: 51.5074,
    endLng: -0.1278,
    color: ["#06b6d4", "#6366f1"],
  },
  {
    startLat: 48.8566,
    startLng: 2.3522,
    endLat: 35.6762,
    endLng: 139.6503,
    color: ["#ec4899", "#8b5cf6"],
  },
  {
    startLat: -33.8688,
    startLng: 151.2093,
    endLat: 34.0522,
    endLng: -118.2437,
    color: ["#10b981", "#3b82f6"],
  },
  {
    startLat: 19.076,
    startLng: 72.8777,
    endLat: 25.2048,
    endLng: 55.2708,
    color: ["#f59e0b", "#ef4444"],
  },
  {
    startLat: 51.5074,
    startLng: -0.1278,
    endLat: 19.076,
    endLng: 72.8777,
    color: ["#6366f1", "#f59e0b"],
  },
  {
    startLat: 25.2048,
    startLng: 55.2708,
    endLat: 1.3521,
    endLng: 103.8198,
    color: ["#ef4444", "#10b981"],
  },
];

const POINTS_DATA = [
  {
    lat: 40.7128,
    lng: -74.006,
    name: "New York",
    bookings: 124,
    color: "#06b6d4",
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    name: "London",
    bookings: 98,
    color: "#6366f1",
  },
  { lat: 48.8566, lng: 2.3522, name: "Paris", bookings: 145, color: "#ec4899" },
  {
    lat: 35.6762,
    lng: 139.6503,
    name: "Tokyo",
    bookings: 210,
    color: "#8b5cf6",
  },
  {
    lat: -33.8688,
    lng: 151.2093,
    name: "Sydney",
    bookings: 67,
    color: "#10b981",
  },
  {
    lat: 34.0522,
    lng: -118.2437,
    name: "Los Angeles",
    bookings: 89,
    color: "#3b82f6",
  },
  {
    lat: 19.076,
    lng: 72.8777,
    name: "Mumbai",
    bookings: 312,
    color: "#f59e0b",
  },
  {
    lat: 25.2048,
    lng: 55.2708,
    name: "Dubai",
    bookings: 245,
    color: "#ef4444",
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    name: "Singapore",
    bookings: 178,
    color: "#10b981",
  },
];

export default function GlobeBackground() {
  const globeRef = useRef<any>();
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [globeWidth, setGlobeWidth] = useState(1000);

  useEffect(() => {
    setIsMounted(true);
    setGlobeWidth(window.innerWidth - 260);

    const handleResize = () => {
      setGlobeWidth(window.innerWidth - 260);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMounted && globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, [isMounted]);

  // Prevent SSR Hydration errors by not rendering the globe on the server
  if (!isMounted) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.8,
          pointerEvents: "auto",
        }}
      >
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          arcsData={ARC_DATA}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          pointsData={POINTS_DATA}
          pointColor="color"
          pointAltitude={0.1}
          pointRadius={0.6}
          pointsMerge={false}
          pointLabel="name"
          onPointClick={(pt: any) => {
            setSelectedPoint(pt);
            if (globeRef.current) {
              globeRef.current.pointOfView(
                { lat: pt.lat, lng: pt.lng, altitude: 1.5 },
                1000,
              );
            }
          }}
          backgroundColor="rgba(0,0,0,0)"
          width={globeWidth}
        />
      </div>

      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "absolute",
              right: 40,
              top: 32,
              width: 280,
              padding: 20,
              zIndex: 10,
              border: `1px solid ${selectedPoint.color}`,
              background: "rgba(20, 20, 40, 0.45)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "20px",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              color: "#fff",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={() => setSelectedPoint(null)}
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MapPin color={selectedPoint.color} size={28} />
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  {selectedPoint.name}
                </h3>
                <div
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}
                >
                  Active Sector
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                background: "rgba(0,0,0,0.3)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: selectedPoint.color,
                }}
              >
                {selectedPoint.bookings}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Total Bookings
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
