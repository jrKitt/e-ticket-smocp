"use client";
import Image from "next/image";
import { useState } from "react";

export default function LoginForm() {
  const [smo_studentID, setStudentID] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smo_studentID }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      window.location.href = "/e-ticket";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xs bg-white border border-[#e3eaf6] rounded-xl shadow-md p-8 flex flex-col items-center">
        <Image
                  src="/SMOLOGO.webp"
                  alt="KKU Logo"
                  width={80}
                  height={80}
                  className="mb-4"
                />
        <h1 className="text-xl font-bold text-[#1565C0] mb-6 text-center">
          SMOCP E-Ticket Login
        </h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Student ID"
            className="border border-[#90CAF9] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition bg-[#f7fbff] text-[#1565C0]"
            value={smo_studentID}
            onChange={(e) => setStudentID(e.target.value)}
            required
            autoComplete="username"
          />
          <button
            type="submit"
            className="bg-[#1565C0] hover:bg-[#1976D2] text-white font-semibold rounded px-4 py-2 mt-2 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
