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
          min-w-0
          pt-16
          lg:ml-72
          lg:pt-[72px]
        "
      >
        <div className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}