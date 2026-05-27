import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a08",
        color: "#f5f5f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "8rem",
          fontWeight: 800,
          lineHeight: 1,
          margin: 0,
          color: "#facc15",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: "1.25rem",
          color: "#a3a39b",
          marginTop: "1rem",
          marginBottom: "2.5rem",
          maxWidth: "28rem",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#facc15",
            color: "#0a0a08",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
        >
          ← Back to Home
        </Link>

        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1.5rem",
            backgroundColor: "transparent",
            color: "#f5f5f0",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            border: "1px solid #333",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
