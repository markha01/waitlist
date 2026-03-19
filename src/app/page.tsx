"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const canSubmit =
    state !== "loading" && name.trim().length > 0 && isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setState("success");
      } else {
        setState("error");
        setErrorMessage(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch {
      setState("error");
      setErrorMessage(
        "Unable to connect right now. Please check your connection and try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient gold glow at top */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af70]/30 to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,112,0.06)_0%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#d4af70]/25 mb-5">
            <span className="text-[#d4af70] text-base leading-none">✦</span>
          </div>

          <h1 className="font-display text-[2.75rem] font-bold text-white leading-none tracking-tight mb-2">
            Liivo
          </h1>
          <p className="text-[#d4af70] text-[10px] tracking-[0.3em] uppercase font-semibold mb-5">
            Hair Salon
          </p>

          <p className="text-[#888] text-[0.9rem] leading-relaxed max-w-[320px] mx-auto">
            We&apos;re putting the finishing touches on something special.
            Join our waitlist and be the first to book.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-7 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          {state === "success" ? (
            <SuccessState email={email} />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-[#888] mb-2 tracking-wide"
                >
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Olivia Harrison"
                  required
                  disabled={state === "loading"}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#888] mb-2 tracking-wide"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="olivia.harrison@gmail.com"
                  required
                  disabled={state === "loading"}
                  className="input-field"
                />
              </div>

              {state === "error" && errorMessage && (
                <ErrorBanner message={errorMessage} />
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-1 bg-[#d4af70] hover:bg-[#c9a96e] active:bg-[#b8955a] text-[#0d0d0d] font-semibold text-sm py-3.5 rounded-xl transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none"
              >
                {state === "loading" ? (
                  <>
                    <Spinner />
                    Reserving your spot…
                  </>
                ) : (
                  "Reserve My Spot"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[#333] text-xs mt-7 leading-relaxed">
          © {new Date().getFullYear()} Liivo Hair Salon
          &nbsp;·&nbsp;
          We respect your privacy
        </p>
      </div>
    </main>
  );
}

function SuccessState({ email }: { email: string }) {
  return (
    <div className="text-center py-3">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#d4af70]/10 border border-[#d4af70]/20 mb-5">
        <svg
          className="w-6 h-6 text-[#d4af70]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="font-display text-2xl font-semibold text-white mb-2">
        You&apos;re on the list!
      </h2>
      <p className="text-[#888] text-sm leading-relaxed max-w-[280px] mx-auto">
        We&apos;ve sent a confirmation to{" "}
        <span className="text-[#d4af70] font-medium">{email}</span>.
        You&apos;ll hear from us as soon as we open for bookings.
      </p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-red-950/25 border border-red-900/30 rounded-xl px-4 py-3">
      <svg
        className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <p className="text-red-400 text-sm leading-snug">{message}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
