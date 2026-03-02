import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Input = ({ label, error, textarea, ...props }: any) => {
    const id = props.id || props.name;
    return (
        <div style={styles.inputGroup}>
            <label htmlFor={id} style={styles.label}>{label}</label>
            {textarea ? (
                <textarea id={id} {...props} style={{
                    ...styles.textarea,
                    border: error ? "1px solid #ef4444" : "1px solid #e2e8f0"
                }} />
            ) : (
                <input id={id} {...props} style={{
                    ...styles.input,
                    border: error ? "1px solid #ef4444" : "1px solid #e2e8f0"
                }} />
            )}
            {error && <span style={styles.errorText}>{error}</span>}
        </div>
    );
};

function VendorSignup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        profession: "",
        description: "",
        eventHistory: "",
        idProof: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, idProof: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = "Full Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.profession.trim()) newErrors.profession = "Profession is required";
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (!formData.idProof) newErrors.idProof = "ID Proof is required";
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const signupData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    signupData.append(key, value);
                }
            });
            signupData.append('role', Role.VENDOR);

            await authApi.register(Role.VENDOR, signupData as any);
            toast.success("Vendor account created! Verify your email with the OTP sent.");
            navigate("/verify-otp", { state: { email: formData.email, type: "signup", backPath: "/vendor/signup", role: Role.VENDOR } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
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
                            alt="vendor signup"
                            style={styles.image}
                        />
                        <div style={styles.imageOverlay}>
                            <h3 style={styles.overlayTitle}>Join Our Network</h3>
                            <p style={styles.overlayText}>Grow your career by connecting with thousands of event planners.</p>
                        </div>
                    </div>

                    <div style={styles.formSection}>
                        <h2 style={styles.title}>Vendor Registration</h2>
                        <p style={styles.subtitle}>Fill in your personal and professional details to get started.</p>

                        <form style={styles.form} onSubmit={handleSubmit}>
                            <div style={styles.sectionTitle}>Basic Information</div>
                            <div style={styles.row}>
                                <div style={{ flex: 1 }}>
                                    <Input label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        type="text"
                                        error={errors.name}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 890"
                                        type="text"
                                        error={errors.phone}
                                    />
                                </div>
                            </div>

                            <Input label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                type="email"
                                error={errors.email}
                            />

                            <div style={styles.row}>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        type="password"
                                        error={errors.password}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label="Confirm"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        type="password"
                                        error={errors.confirmPassword}
                                    />
                                </div>
                            </div>

                            <div style={styles.sectionTitle}>Professional Details</div>
                            <div style={styles.row}>
                                <div style={{ flex: 1 }}>
                                    <Input label="Profession"
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleChange}
                                        placeholder="Photography, Catering..."
                                        type="text"
                                        error={errors.profession}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input label="Current Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="123 Street, City"
                                        type="text"
                                        error={errors.address}
                                    />
                                </div>
                            </div>

                            <Input label="Bio / Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell us about your services..."
                                textarea
                                rows={3}
                            />

                            <Input label="Event History"
                                name="eventHistory"
                                value={formData.eventHistory}
                                onChange={handleChange}
                                placeholder="Past events you've handled..."
                                textarea
                                rows={3}
                            />

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>ID Proof (Identity Document)</label>
                                <div
                                    style={{
                                        ...styles.fileInputContainer,
                                        border: errors.idProof ? "1px dashed #ef4444" : "1px dashed #cbd5e1"
                                    }}
                                    onClick={() => document.getElementById('idProof')?.click()}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="ID Preview" style={styles.previewImage} />
                                    ) : (
                                        <div style={styles.filePlaceholder}>
                                            <span style={{ fontSize: '24px' }}>📷</span>
                                            <span>Click to upload ID Proof</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="idProof"
                                        name="idProof"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>
                                {errors.idProof && <span style={styles.errorText}>{errors.idProof}</span>}
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
                                    {isLoading ? 'Processing...' : 'Register as Vendor'}
                                </button>
                            </div>
                        </form>

                        <p style={styles.footer}>
                            Already a partner?{" "}
                            <span style={styles.link} onClick={() => navigate("/vendor/login")}>Login here</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: any = {
    pageCenter: { backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" },
    wrapper: { display: "flex", justifyContent: "center", padding: "40px 20px", width: "100%" },
    container: { display: "flex", backgroundColor: "white", borderRadius: "30px", width: "1200px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    imageSection: { flex: 0.8, position: "relative" },
    image: { width: "100%", height: "100%", objectFit: "cover" },
    imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", color: "white" },
    overlayTitle: { fontSize: "32px", fontWeight: 700, margin: "0 0 10px 0" },
    overlayText: { fontSize: "16px", opacity: 0.9, margin: 0 },
    formSection: { flex: 1.2, padding: "50px", overflowY: "auto", maxHeight: "90vh" },
    title: { fontSize: "32px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" },
    subtitle: { fontSize: "15px", color: "#64748b", marginBottom: "35px" },
    sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", margin: "20px 0 15px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" },
    form: { display: "flex", flexDirection: "column", gap: "10px" },
    row: { display: "flex", gap: "20px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "5px" },
    label: { fontSize: "13px", fontWeight: 600, color: "#475569", marginLeft: "4px" },
    input: { padding: "12px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", fontSize: "14px", transition: "all 0.2s", outline: "none" },
    textarea: { padding: "12px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", fontSize: "14px", transition: "all 0.2s", outline: "none", resize: "none" },
    buttonRow: { display: "flex", gap: "15px", marginTop: "25px" },
    googleBtn: {
        flex: 0.4,
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.1)",
        backgroundColor: "rgba(255,255,255,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: "14px",
        backdropFilter: "blur(5px)",
        transition: "all 0.3s"
    },
    loginBtn: {
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid rgba(37, 99, 235, 0.1)",
        backgroundColor: "rgba(37, 99, 235, 0.05)",
        color: "rgba(37, 99, 235, 0.7)",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "15px",
        backdropFilter: "blur(5px)",
        transition: "all 0.3s"
    },
    footer: { textAlign: "center", marginTop: "30px", fontSize: "14px", color: "#64748b" },
    link: { color: "#2563eb", fontWeight: 700, cursor: "pointer" },
    errorText: { color: "#ef4444", fontSize: "11px", marginTop: "2px", marginLeft: "4px" },
    fileInputContainer: {
        width: '100%',
        height: '150px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s',
        marginTop: '5px'
    },
    filePlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        color: '#64748b',
        fontSize: '14px'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    }
};

export default VendorSignup;
