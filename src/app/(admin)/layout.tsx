import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-60">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-page-bg p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
