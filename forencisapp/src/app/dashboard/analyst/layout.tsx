import DashboardSidebar from "@/components/dashboard-sidebar";

export default function AnalystDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      <DashboardSidebar role="analyst" />

      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
    </div>
  );
}