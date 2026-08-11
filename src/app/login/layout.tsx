import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Authentication | DIGITAL NEPAL CITIZEN ",
  description: "Secure access gateway for administrative tiers.",
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      <div
        className="absolute -top-[40%] left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-[20%] left-[10%] -z-10 h-[400px] w-[600px] rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-500/2"
        aria-hidden="true"
      />

      <main className="relative w-full">
        <div className="w-full">{children}</div>
      </main>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} Government of Nepal. All Rights
        Reserved.
      </footer>
    </div>
  );
}