
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE]">
      <DashboardSidebar role="admin" />

      <main
        className="
          min-h-screen
          pt-[68px]
          lg:pl-72
          lg:pt-[76px]
        "
      >
        {children}
      </main>
    </div>
  );
}

