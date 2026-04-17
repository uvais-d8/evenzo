import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepositories } from "../../../infrastructure/context/RepositoryContext";
import { Role } from "../../../core/enums/Role.enum";
import toast from "react-hot-toast";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../core/constants/Messages";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
        <path d="M3.964 10.707a5.41 5.41 0 01-.282-1.707c0-.596.102-1.174.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.443 2.041.957 4.961L3.964 7.29A5.41 5.41 0 019 3.58z" fill="#EA4335" />
    </svg>
);

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

function UserLogin() {
    const navigate = useNavigate();
    const { authRepository } = useRepositories();

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
            const { token, refreshToken, user } = await authRepository.login(Role.USER, formData);
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("userRole", Role.USER);
            sessionStorage.setItem("userData", JSON.stringify(user));
            toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            navigate("/");
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
                        alt="login"
                        style={styles.image}
                    />
                </div>

                <div style={styles.formSection}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Welcome to Evenzo</h2>
                        <p style={styles.subtitle}>Discover and book amazing services for your next event.</p>
                    </div>

                    <form style={styles.form} onSubmit={handleSubmit}>
                        <Input label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            type="email"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            type="password"
                            error={errors.password}
                        />

                        <div style={styles.forgotRow}>
                            <span style={styles.forgot} onClick={() => navigate("/forgot-password")}>Forgot password?</span>
                        </div>

                        <div style={styles.buttonRow}>
                            <button type="submit" style={styles.loginBtn} disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Login'}
                            </button>
                            <button type="button" style={styles.googleBtn}>
                                <GoogleIcon /> Continue with Google
                            </button>
                        </div>
                    </form>

                    <p style={styles.footer}>
                        New to Evenzo?{" "}
                        <span style={styles.link} onClick={() => navigate("/signup")}>Create account</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    pageCenter: { backgroundColor: "#f9fafb", minHeight: "calc(100vh - 80px)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
    container: { display: "flex", backgroundColor: "white", borderRadius: "30px", width: "1000px", maxWidth: "95vw", boxShadow: "0 25px 50px rgba(0, 0, 0, 0.05)", padding: "20px", gap: "20px" },
    imageSection: { flex: 1.2, display: "none" as any },
    image: { width: "100%", height: "550px", objectFit: "cover", borderRadius: "20px" },
    formSection: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px" },
    header: { marginBottom: '30px' },
    title: { fontSize: "24px", fontWeight: 500, color: '#1e293b', marginBottom: "8px" },
    subtitle: { fontSize: "14px", color: "#64748b", fontWeight: 300, lineHeight: 1.5 },
    form: { display: "flex", flexDirection: "column", gap: "20px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginLeft: "2px" },
    input: { padding: "12px 15px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px", fontWeight: 300, outline: "none" },
    forgotRow: { display: "flex", justifyContent: "flex-end", marginTop: "-10px" },
    forgot: { fontSize: "12px", color: "#2563eb", cursor: "pointer", fontWeight: 400 },
    buttonRow: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" },
    loginBtn: { padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "13px", textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.15)' },
    googleBtn: { padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: 500, cursor: "pointer", fontSize: "12px", color: '#475569' },
    footer: { textAlign: "center", marginTop: "30px", fontSize: "13px", color: "#64748b", fontWeight: 300 },
    link: { color: "#2563eb", fontWeight: 500, cursor: "pointer" },
    errorText: { color: "#ef4444", fontSize: "11px", marginTop: "4px" },
};

if (typeof window !== 'undefined' && window.innerWidth > 900) {
    (styles.imageSection as any).display = "block";
}

export default UserLogin;
