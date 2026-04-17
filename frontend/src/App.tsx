import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import UserLayout from "./presentation/layouts/UserLayout";
import AdminLayout from "./presentation/layouts/AdminLayout";
import VendorLayout from "./presentation/layouts/VendorLayout";

// Auth pages
import Login from "./presentation/pages/user/UserLogin";
import Signup from "./presentation/pages/user/UserSignup";
import OtpVerification from "./presentation/pages/user/OtpVerification";
import ForgotPassword from "./presentation/pages/user/ForgotPassword";
import ResetPassword from "./presentation/pages/user/ResetPassword";
import Home from "./presentation/pages/user/Home";

// Vendor pages
import VendorLogin from "./presentation/pages/vendor/VendorLogin";
import VendorSignup from "./presentation/pages/vendor/VendorSignup";
import VendorDashboard from "./presentation/pages/vendor/VendorDashboard";
import VendorProfile from "./presentation/pages/vendor/VendorProfile";
import VendorServices from "./presentation/pages/vendor/VendorServices";
import VendorSamples from "./presentation/pages/vendor/VendorSamples";
import VendorBookings from "./presentation/pages/vendor/VendorBookings";
import VendorPassword from "./presentation/pages/vendor/VendorPassword";
import VendorWallet from "./presentation/pages/vendor/VendorWallet";
import VendorEvents from "./presentation/pages/vendor/VendorEvents";

// Admin pages
import AdminLogin from "./presentation/pages/admin/AdminLogin";
import AdminDashboard from "./presentation/pages/admin/AdminDashboard";
import UserManagement from "./presentation/pages/admin/UserManagement";
import VendorVerification from "./presentation/pages/admin/VendorVerification";
import CategoryManagement from "./presentation/pages/admin/CategoryManagement";
import ProviderManagement from "./presentation/pages/admin/ProviderManagement";

// Coming soon placeholder
import ComingSoon from "./presentation/pages/ComingSoon";
import AdminEvents from "./presentation/pages/admin/AdminEvents";

import AuthGuard from "./presentation/components/AuthGuard";
import { axiosClient } from "./infrastructure/http/axiosClient";

function App() {
  const [isChecking, setIsChecking] = React.useState(false);

  // Global block-status polling
  React.useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("userRole");
    if (!token) { setIsChecking(false); return; }

    const checkStatus = async () => {
      try {
        const endpoint =
          role === "admin" ? "/admin/users" :
            role === "vendor" ? "/vendor/profile" :
              "/user/profile";
        await axiosClient.get(endpoint);
      } catch {
        // apiClient handles 403 → logout
      } finally {
        setIsChecking(false);
      }
    };

    setIsChecking(true);
    checkStatus();

    const interval = setInterval(checkStatus, 5000);
    const onVisible = () => { if (document.visibilityState === "visible") checkStatus(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  if (isChecking) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <p style={{ color: "#2563eb", fontWeight: 600 }}>Verifying session...</p>
    </div>
  );

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>

        {/* ═══════════════ GUEST ROUTES ═══════════════ */}
        {/* Auth pages are flat routes — "/" is NOT claimed here */}
        <Route element={<AuthGuard mode="guest" />}>

          {/* User auth — each page is an explicit path, not nested under "/" */}
          <Route element={<UserLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Vendor auth */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/signup" element={<VendorSignup />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

        </Route>

        {/* ═══════════════ AUTHENTICATED ROUTES ═══════════════ */}
        <Route element={<AuthGuard mode="authenticated" />}>

          {/* ── USER HOME — "/" is exclusively here ── */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* ── VENDOR (role-protected) ── */}
          <Route path="/vendor" element={<AuthGuard mode="authenticated" allowedRole="vendor" />}>
            <Route element={<VendorLayout />}>
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="events" element={<VendorEvents />} />
              <Route path="services" element={<VendorServices />} />
              <Route path="samples" element={<VendorSamples />} />
              <Route path="bookings" element={<VendorBookings />} />
              <Route path="password" element={<VendorPassword />} />
              <Route path="wallet" element={<VendorWallet />} />
              <Route path="notifications" element={<ComingSoon title="Notifications" />} />
            </Route>
          </Route>

          {/* ── ADMIN (role-protected) ── */}
          <Route path="/admin" element={<AuthGuard mode="authenticated" allowedRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="providers" element={<ProviderManagement />} />
              <Route path="providers/pending" element={<VendorVerification />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="bookings" element={<ComingSoon title="Booking Management" />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="wallet" element={<ComingSoon title="Wallet" />} />
              <Route path="notifications" element={<ComingSoon title="Notifications" />} />
            </Route>
          </Route>

        </Route>

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;