import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../../infrastructure/api/auth.api";
import { Role } from "../../../core/enums/Role.enum";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
        <path d="M3.964 10.707a5.41 5.41 0 01-.282-1.707c0-.596.102-1.174.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.443 2.041.957 4.961L3.964 7.29A5.41 5.41 0 019 3.58z" fill="#EA4335" />
    </svg>
);

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

function VendorLogin() {
    const navigate = useNavigate();
    const searchLocation = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(searchLocation.search);
        if (params.get("error") === "blocked") {
            toast.error("Access denied. Your account has been blocked by admin.");
            navigate("/vendor/login", { replace: true });
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
            const res = await authApi.login(Role.VENDOR, formData);
            const { token, refreshToken, user } = res.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("userRole", Role.VENDOR);
            sessionStorage.setItem("userData", JSON.stringify(user));

            toast.success("Login successful!");
            navigate("/vendor/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const res = await authApi.googleLogin(tokenResponse.access_token, Role.VENDOR);
                const { token, refreshToken, user } = res.data;
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("refreshToken", refreshToken);
                sessionStorage.setItem("userRole", Role.VENDOR);
                sessionStorage.setItem("userData", JSON.stringify(user));
                toast.success("Login successful!");
                navigate("/vendor/dashboard");
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Google login failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => toast.error("Google login failed")
    });

    return (
        <div style={styles.pageCenter}>
            <div style={styles.wrapper}>
                <div style={styles.container}>
                    <div style={styles.imageSection}>
                        <img
                            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
                            alt="vendor dashboard"
                            style={styles.image}
                        />
                    </div>

                    <div style={styles.formSection}>
                        <h2 style={styles.title}>Vendor Partner Login</h2>
                        <p style={styles.subtitle}>Welcome back to your dashboard</p>

                        <form style={styles.form} onSubmit={handleSubmit}>
                            <Input label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                type="email"
                                error={errors.email}
                            />

                            <Input
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                type="password"
                                error={errors.password}
                            />

                            <div style={styles.forgotRow}>
                                <span style={styles.forgot} onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
                            </div>

                            <div style={styles.buttonRow}>
                                <button
                                    type="button"
                                    onClick={() => loginWithGoogle()}
                                    style={styles.googleBtn}
                                >
                                    <GoogleIcon /> Google
                                </button>

                                <button type="submit" style={styles.loginBtn} disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'Login Vendor'}
                                </button>
                            </div>
                        </form>

                        <p style={styles.footer}>
                            Not registered as a vendor?{" "}
                            <span style={styles.link} onClick={() => navigate("/vendor/signup")}>Join us</span>
                        </p>
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
    forgotRow: { display: "flex", justifyContent: "flex-end" },
    forgot: { fontSize: "13px", color: "#2563eb", cursor: "pointer" },
    buttonRow: { display: "flex", gap: "15px", marginTop: "10px" },
    googleBtn: { flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #c2c2c2", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: 600, cursor: "pointer", fontSize: "14px", height: "40px" },
    loginBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.1)', backgroundColor: 'rgba(37, 99, 235, 0.05)', color: 'rgba(37, 99, 235, 0.6)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'all 0.2s' },
    footer: { textAlign: "center", marginTop: "25px", fontSize: "14px", color: "#71717a" },
    link: { color: "#2563eb", fontWeight: 600, cursor: "pointer" },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "6px" },
};

export default VendorLogin;
