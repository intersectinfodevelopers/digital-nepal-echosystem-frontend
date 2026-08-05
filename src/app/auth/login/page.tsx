"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Interface Control Hooks
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const errors: { username?: string; password?: string } = {};
    const usernameRegex = /^[a-zA-Z0-9_\.-]+$/;

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (!usernameRegex.test(username)) {
      errors.username =
        "Username can only contain alphanumeric characters, underscores, hyphens, or dots";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setServerError(
            data.error || "Invalid credentials or validation rejection.",
          );
          return;
        }

        // Server sets an HttpOnly session cookie; no client-side token storage.

        if (data.redirectTo) {
          router.push(data.redirectTo);
          router.refresh();
        }
      } catch {
        setServerError("Network communication connection failure.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Central Registry System
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in using administrative credentials
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
          {serverError && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
            >
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  disabled={isPending}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full rounded-lg border px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:text-white ${
                    fieldErrors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="e.g., kummayak.admin"
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={isPending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:text-white ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-600 dark:text-slate-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isPending ? "Verifying..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
