import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRepositories } from "../../../infrastructure/context/RepositoryContext";
import { Role } from "../../../core/enums/enum";
import toast from "react-hot-toast";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../core/constants/Messages";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
    const id = props.id || props.name;
    return (
        <div style={styles.inputGroup}>
            <label htmlFor={id} style={styles.label}>{label}</label>
            <input id={id} {...props} style={{
                ...styles.input,
                border: error ? "1px solid #ef4444" : "1px solid #e2e8f0"
            }} />
            {error && <span style={styles.errorText}>{error}</span>}
        </div>
    );
};

function AdminLogin() {
    const navigate = useNavigate();
    const searchLocation = useLocation();
    const { authRepository } = useRepositories();

    useEffect(() => {
        const params = new URLSearchParams(searchLocation.search);
        if (params.get("error") === "blocked") {
            toast.error(ERROR_MESSAGES.ACCOUNT_BLOCKED || "Access denied. Your account has been blocked.");
            navigate("/admin/login", { replace: true });
        }
    }, [searchLocation, navigate]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const { token, refreshToken, user } = await authRepository.login(Role.ADMIN, formData);

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("userRole", Role.ADMIN);
            sessionStorage.setItem("userData", JSON.stringify(user));

            toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            navigate("/admin/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.LOGIN_FAILED);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageCenter}>
            <div style={styles.container}>
                <div style={styles.imageSection}>
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
                        alt="admin portal"
                        style={styles.image}
                    />
                </div>

                <div style={styles.formSection}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Admin Access</h2>
                        <p style={styles.subtitle}>Sign in to manage the platform</p>
                    </div>

                    <form style={styles.form} onSubmit={handleSubmit}>
                        <Input label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter admin email"
                            type="email"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter admin password"
                            type="password"
                            error={errors.password}
                        />

                        <div style={styles.buttonRow}>
                            <button type="submit" style={styles.loginBtn} disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Secure Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    pageCenter: { backgroundColor: "#f9fafb", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
    container: { display: "flex", backgroundColor: "white", borderRadius: "30px", width: "1000px", maxWidth: "95vw", boxShadow: "0 25px 50px rgba(0, 0, 0, 0.05)", padding: "20px", gap: "20px" },
    imageSection: { flex: 1.2, display: "none" as any }, // Will be visible on larger screens
    image: { width: "100%", height: "100%", minHeight: "500px", objectFit: "cover", borderRadius: "20px" },
    formSection: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px" },
    header: { marginBottom: '30px' },
    title: { fontSize: "24px", fontWeight: 500, color: '#1e293b', marginBottom: "8px" },
    subtitle: { fontSize: "14px", color: "#64748b", fontWeight: 300 },
    form: { display: "flex", flexDirection: "column", gap: "20px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginLeft: "2px" },
    input: { padding: "12px 15px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px", fontWeight: 300, outline: "none", transition: "all 0.2s" },
    buttonRow: { marginTop: "10px" },
    loginBtn: { width: '100%', padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "13px", transition: "all 0.2s", textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.15)' },
    errorText: { color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: 400 },
};

// Add media queries via a simple object check
if (typeof window !== 'undefined' && window.innerWidth > 900) {
    (styles.imageSection as any).display = "block";
}

export default AdminLogin;
