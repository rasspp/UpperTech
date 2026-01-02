import AdminDashboardLayout from "@/components/admin/admin-dashboard-layout";
import AdminDashboardPage from "./page";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      <AdminDashboardPage />
    </AdminDashboardLayout>
  );
}