import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-4">
      <div className="mb-4">
        <Breadcrumbs />
      </div>
      {children}
    </div>
  );
}
