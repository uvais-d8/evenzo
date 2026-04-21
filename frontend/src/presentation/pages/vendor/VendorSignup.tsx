import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepositories } from "../../../infrastructure/context/RepositoryContext";
import { Role } from "../../../core/enums/enum";
import { useGoogleLogin } from "@react-oauth/google";
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    error?: string;
    textarea?: boolean;
    rows?: number;
}

const Input: React.FC<InputProps> = ({ label, error, textarea, ...props }) => {
    const id = props.id || props.name;
    return (
        <div style={styles.inputGroup}>
            <label htmlFor={id} style={styles.label}>{label}</label>
            {textarea ? (
                <textarea id={id} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} style={{
                    ...styles.textarea,
                    border: error ? "1px solid #ef4444" : "1px solid #e2e8f0"
                }} />
            ) : (
                <input id={id} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} style={{
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
    const { authRepository } = useRepositories();

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
    const [errors, setErrors] = useState<Record<string, string>>({});
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
        const newErrors: Record<string, string> = {};
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
            return;
        }

        setIsLoading(true);
        try {
            const signupData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    signupData.append(key, value as any);
                }
            });
            signupData.append('role', Role.VENDOR);

            await authRepository.register(Role.VENDOR, signupData);
            toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
            navigate("/verify-otp", { state: { email: formData.email, type: "signup", backPath: "/vendor/signup", role: Role.VENDOR } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.REGISTER_FAILED);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const { token, refreshToken, user } = await authRepository.googleLogin(tokenResponse.access_token, Role.VENDOR);
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("refreshToken", refreshToken);
                sessionStorage.setItem("userRole", Role.VENDOR);
                sessionStorage.setItem("userData", JSON.stringify(user));
                toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
                navigate("/vendor/dashboard");
            } catch (error: any) {
                toast.error(error.response?.data?.message || ERROR_MESSAGES.DEFAULT);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => toast.error(ERROR_MESSAGES.LOGIN_FAILED)
    });

    return (
        <div style={styles.pageCenter}>
            <div style={styles.container}>
                <div style={styles.imageSection}>
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
                        alt="vendor signup"
                        style={styles.image}
                    />
                    <div style={styles.imageOverlay}>
                        <h3 style={styles.overlayTitle}>Partner with Evenzo</h3>
                        <p style={styles.overlayText}>Join our premier network of event professionals and reach thousands of customers.</p>
                    </div>
                </div>

                <div style={styles.formSection}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Vendor Registration</h2>
                        <p style={styles.subtitle}>Create your business profile to get started.</p>
                    </div>

                    <form style={styles.form} onSubmit={handleSubmit}>
                        <div style={styles.sectionTitle}>Business Info</div>
                        <div style={styles.row}>
                            <Input label="Business Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Elite Events"
                                type="text"
                                error={errors.name}
                            />
                            <Input label="Contact Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. +1234567890"
                                type="text"
                                error={errors.phone}
                            />
                        </div>

                        <Input label="Business Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="business@example.com"
                            type="email"
                            error={errors.email}
                        />

                        <div style={styles.row}>
                            <Input
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                type="password"
                                error={errors.password}
                            />
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

                        <div style={styles.sectionTitle}>Professional Presence</div>
                        <div style={styles.row}>
                            <Input label="Speciality"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                placeholder="Catering, Music, etc."
                                type="text"
                                error={errors.profession}
                            />
                            <Input label="Base Location"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="City, State"
                                type="text"
                                error={errors.address}
                            />
                        </div>

                        <Input label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Briefly describe your services..."
                            textarea
                            rows={3}
                        />

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>ID Proof (Verification Document)</label>
                            <label style={{
                                ...styles.fileInputContainer,
                                border: errors.idProof ? "1px dashed #ef4444" : "1px dashed #e2e8f0"
                            }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="ID Preview" style={styles.previewImage} />
                                ) : (
                                    <div style={styles.filePlaceholder}>
                                        <span style={{ fontSize: '20px' }}>📁</span>
                                        <span>Click to upload identity document</span>
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
                            </label>
                            {errors.idProof && <span style={styles.errorText}>{errors.idProof}</span>}
                        </div>

                        <div style={styles.buttonRow}>
                            <button type="submit" style={styles.loginBtn} disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Apply for Partnership'}
                            </button>
                            <button
                                type="button"
                                onClick={() => loginWithGoogle()}
                                style={styles.googleBtn}
                            >
                                <GoogleIcon /> Join with Google
                            </button>
                        </div>
                    </form>

                    <p style={styles.footer}>
                        Already a partner?{" "}
                        <span style={styles.link} onClick={() => navigate("/vendor/login")}>Back to Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    pageCenter: { backgroundColor: "#f9fafb", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
    container: { display: "flex", backgroundColor: "white", borderRadius: "30px", width: "1100px", maxWidth: "95vw", boxShadow: "0 25px 50px rgba(0, 0, 0, 0.05)", overflow: "hidden", maxHeight: "90vh" },
    imageSection: { flex: 0.8, position: "relative", display: "none" as any },
    image: { width: "100%", height: "100%", objectFit: "cover" },
    imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", color: "white" },
    overlayTitle: { fontSize: "28px", fontWeight: 500, margin: "0 0 10px 0" },
    overlayText: { fontSize: "14px", opacity: 0.9, margin: 0, lineHeight: 1.5, fontWeight: 300 },
    formSection: { flex: 1.2, padding: "40px", overflowY: "auto" },
    header: { marginBottom: '30px' },
    title: { fontSize: "24px", fontWeight: 500, color: "#1e293b", marginBottom: "8px" },
    subtitle: { fontSize: "14px", color: "#64748b", fontWeight: 300 },
    sectionTitle: { fontSize: "11px", fontWeight: 500, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", margin: "25px 0 15px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    row: { display: "flex", gap: "15px" },
    inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { padding: "10px 15px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px", fontWeight: 300, outline: "none", transition: "all 0.2s" },
    textarea: { padding: "12px 15px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px", fontWeight: 300, outline: "none", resize: "none" },
    buttonRow: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" },
    loginBtn: { padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "12px", textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.15)' },
    googleBtn: { padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: 500, cursor: "pointer", fontSize: "12px", color: '#475569' },
    footer: { textAlign: "center", marginTop: "30px", fontSize: "13px", color: "#64748b", fontWeight: 300 },
    link: { color: "#2563eb", fontWeight: 500, cursor: "pointer" },
    errorText: { color: "#ef4444", fontSize: "11px", marginTop: "2px" },
    fileInputContainer: { width: '100%', height: '120px', backgroundColor: '#fafafa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px dashed #e2e8f0' },
    filePlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: 300 },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' }
};

if (typeof window !== 'undefined' && window.innerWidth > 900) {
    (styles.imageSection as any).display = "block";
}

export default VendorSignup;
