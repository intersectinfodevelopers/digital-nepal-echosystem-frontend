"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getCurrentSession, ROLE_HOME_ROUTE } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (session?.role) {
      router.replace(ROLE_HOME_ROUTE[session.role as keyof typeof ROLE_HOME_ROUTE]);
    }
  }, [router]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const session = loginUser(email, password);
      if (session) {
        router.push(ROLE_HOME_ROUTE[session.role as keyof typeof ROLE_HOME_ROUTE]);
        router.refresh();
        return;
      }
      setIsSubmitting(false);
      setServerError("Invalid credentials. Please check your email and password.");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="relative mx-auto flex min-h-[360px] max-w-2xl overflow-hidden rounded-[28px] shadow-[0_24px_50px_rgba(15,45,109,0.10)]">

        {/* Left panel */}
        <aside
          className="relative hidden w-[34%] flex-col px-8 py-8 text-white lg:flex"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {/* Government of Nepal badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/85">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M6 4h12a2 2 0 0 1 2 2v2H4V6a2 2 0 0 1 2-2Zm12 14H6a2 2 0 0 1-2-2v-2h16v2a2 2 0 0 1-2 2Zm0-6H4v2h16v-2Z" />
              </svg>
            </span>
            Government of Nepal
          </div>

          {/* Centered logo / title / subtitle */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <img src="/assets/Flag_of_Nepal.gif" alt="Nepal flag" className="h-7 w-auto" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Digital Nepal</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
              Empowering citizens through digital accessibility.
            </p>
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex w-full items-center justify-center bg-white px-6 py-8 sm:px-10 sm:py-10 lg:w-[66%]">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
                Sign In
              </h1>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                Enter your credentials to access Digital Nepal portal
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {serverError && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{ borderColor: "var(--active-red)", backgroundColor: "rgba(192,31,56,0.08)", color: "var(--active-red)" }}
                >
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full rounded-md border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: fieldErrors.email ? "var(--active-red)" : "var(--border)",
                    color: "var(--foreground)",
                    backgroundColor: "white",
                    outlineColor: "var(--primary)",
                  }}
                  placeholder="name@example.com"
                />
                {fieldErrors.email && (
                  <p className="mt-2 text-xs" style={{ color: "var(--active-red)" }}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: fieldErrors.password ? "var(--active-red)" : "var(--border)",
                      color: "var(--foreground)",
                      backgroundColor: "white",
                      outlineColor: "var(--primary)",
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-2 text-xs" style={{ color: "var(--active-red)" }}>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border"
                    style={{ borderColor: "var(--border)" }}
                  />
                  Remember me
                </label>
                <button type="button" className="text-sm font-semibold" style={{ color: "var(--active-red)" }}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {isSubmitting ? "Verifying..." : "Sign In"}
              </button>

              <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <button type="button" className="hover:underline">
                  Terms
                </button>
                <button type="button" className="hover:underline">
                  Privacy
                </button>
                <button type="button" className="hover:underline">
                  Help Center
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}