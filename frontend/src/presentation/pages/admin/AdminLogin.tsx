import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../../infrastructure/api/auth.api";
import { Role } from "../../../core/enums/Role.enum";
import toast from "react-hot-toast";

const Input = ({ label, error, ...props }: any) => {
    const id = props.id || props.name;
    return (
        <div style={styles.inputGroup}>
            <label htmlFor={id} style={styles.label}>{label}</label>
            <input id={id} {...props} style={{
                ...styles.input,
                border: error ? "1px solid #ef4444" : "1px solid #c2c2c2"
            }} />
            {error && <span style={styles.errorText}>{error}</span>}
        </div>
    );
};

function AdminLogin() {
    const navigate = useNavigate();
    const searchLocation = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(searchLocation.search);
        if (params.get("error") === "blocked") {
            toast.error("Access denied. Your account has been blocked.");
            navigate("/admin/login", { replace: true });
        }
    }, [searchLocation, navigate]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: any = {};
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const res = await authApi.login(Role.ADMIN, formData);
            const { token, refreshToken, user } = res.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("userRole", Role.ADMIN);
            sessionStorage.setItem("userData", JSON.stringify(user));

            toast.success("Login successful!");
            navigate("/admin/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageCenter}>
            <div style={styles.wrapper}>
                <div style={styles.container}>
                    <div style={styles.imageSection}>
                        <img
                            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
                            alt="admin portal"
                            style={styles.image}
                        />
                    </div>

                    <div style={styles.formSection}>
                        <h2 style={styles.title}>Admin Access</h2>
                        <p style={styles.subtitle}>Sign in to manage the platform</p>

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
                                    {isLoading ? 'Loading...' : 'Login Server'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: any = {
    pageCenter: { backgroundColor: "#f5f6f8", minHeight: "calc(100vh - 130px)", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" },
    wrapper: { display: "flex", justifyContent: "center", padding: "40px 20px" },
    container: { display: "flex", backgroundColor: "white", borderRadius: "20px", width: "1100px", boxShadow: "0 15px 40px rgba(0, 0, 0, 0.09)", padding: "30px", gap: "40px" },
    imageSection: { flex: 1 },
    image: { width: "100%", height: "550px", objectFit: "cover", borderRadius: "20px" },
    formSection: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
    title: { fontSize: "30px", fontWeight: 500, marginBottom: "5px" },
    subtitle: { fontSize: "14px", color: "#71717a", marginBottom: "25px" },
    form: { display: "flex", flexDirection: "column", gap: "18px" },
    inputGroup: { display: "flex", flexDirection: "column" },
    label: { fontSize: "14px", marginBottom: "5px", fontWeight: 600, marginLeft: "6px" },
    input: { padding: "14px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px" },
    buttonRow: { display: "flex", gap: "15px", marginTop: "10px" },
    loginBtn: { flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid rgba(37, 99, 235, 0.1)", backgroundColor: "rgba(37, 99, 235, 0.05)", color: "rgba(37, 99, 235, 0.6)", fontWeight: 600, cursor: "pointer", fontSize: "14px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.2s" },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "6px" },
};

export default AdminLogin;
