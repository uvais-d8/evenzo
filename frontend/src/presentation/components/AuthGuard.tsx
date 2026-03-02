import { Navigate, Outlet } from "react-router-dom";

interface AuthGuardProps {
    mode: "authenticated" | "guest";
    allowedRole?: "admin" | "vendor" | "user";
}

const AuthGuard = ({ mode, allowedRole }: AuthGuardProps) => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("userRole");

    // Helper to get normalized role
    const getNormalizedRole = () => userRole?.toLowerCase().trim() || "";

    if (mode === "authenticated") {
        // If not logged in, go to login
        if (!token) {
            return <Navigate to="/login" replace />;
        }

        // If role restricted, check role
        const role = getNormalizedRole();
        if (allowedRole && role !== allowedRole.toLowerCase()) {
            // Redirect to their respective dashboard if they try to access another role's area
            if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
            if (role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
            return <Navigate to="/" replace />;
        }

        return <Outlet />;
    }

    // mode === "guest"
    if (token) {
        // If already logged in, redirect to their respective home
        const role = getNormalizedRole();
        if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
        if (role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
