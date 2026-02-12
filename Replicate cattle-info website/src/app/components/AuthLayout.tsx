import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <Outlet />
    </div>
  );
}
