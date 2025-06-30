import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white/95 rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <Image
          src="/kku-logo.png"
          alt="KKU Logo"
          width={80}
          height={80}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-[#1565C0] mb-1 text-center">
          Computer Science KKU
        </h1>
        <p className="text-[#1565C0] mb-6 text-center font-medium">
          Sign in to continue
        </p>
        <form className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Student ID / Email"
            className="border border-[#90CAF9] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-[#90CAF9] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="bg-[#1565C0] hover:bg-[#1976D2] text-white font-semibold rounded px-4 py-2 mt-2 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-sm text-[#1565C0]">
          <a href="#" className="hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="mt-6 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Computer Science, Khon Kaen University
        </div>
      </div>
    </div>
  );
}
