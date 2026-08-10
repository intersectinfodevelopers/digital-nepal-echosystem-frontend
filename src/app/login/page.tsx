"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWardAdmin, getWardAdminSession } from "@/services/wardAuth.service";

export default function LoginPage() {
  const router = useRouter();

  // Interface Control Hooks
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

 
  useEffect(() => {
    const session = getWardAdminSession();
    if (session?.ward_id) {
      router.replace("/ward/dashboard");
    }
  }, [router]);

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

    
    setIsSubmitting(true);
    setTimeout(() => {
      const wardSession = loginWardAdmin(username, password);
      if (wardSession) {
        router.push("/ward/dashboard");
        router.refresh();
        return;
      }

      setIsSubmitting(false);
      setServerError(
        "Invalid credentials. Only registered ward admins can sign in.",
      );
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Central Registry System
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in using administrative credentials
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {serverError && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
            >
              {serverError}
            </div>
          )}

          {isSubmitting && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
            >
              <svg
                className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying credentials, please wait...
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
                  disabled={isSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full rounded-lg border px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:text-white ${
                    fieldErrors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="e.g., ward1.kummayak"
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
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:text-white ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Sign In"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Ward admin : <span className="font-mono">ward1.kummayak / ward1pass</span>
          </p>
        </form>
      </div>
    </div>
  );
}
