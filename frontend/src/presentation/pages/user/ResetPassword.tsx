import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../../infrastructure/api/auth.api";
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

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [formData, setFormData] = useState({
        otp: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.otp.trim()) {
            newErrors.otp = "OTP is required";
        } else if (formData.otp.length !== 6) {
            newErrors.otp = "OTP must be 6 digits";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
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
            await authApi.resetPassword({ email, password: formData.password });
            toast.success("Password reset successfully! You can now login.");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <div style={styles.pageCenter}>
                <p>Invalid access. Missing email.</p>
                <button onClick={() => navigate("/forgot-password")} style={styles.backBtn}>Back</button>
            </div>
        );
    }

    return (
        <div style={styles.pageCenter}>
            <div style={styles.container}>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>
                    Enter the 6-digit OTP sent to {email} and your new password.
                    <br /> Note: The current backend flow accepts resetPassword directly, but verify OTP is also required. Adjust based on your backend.
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <Input
                        label="OTP"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="6-digit OTP"
                        type="text"
                        error={errors.otp}
                    />

                    <Input
                        label="New Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        type="password"
                        error={errors.password}
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        type="password"
                        error={errors.confirmPassword}
                    />

                    <button type="submit" style={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <p style={styles.backText} onClick={() => navigate("/login")}>
                    ← Back to Login
                </p>
            </div>
        </div>
    );
}

const styles: any = {
    pageCenter: { backgroundColor: "#f5f6f8", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
    container: { backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center" },
    title: { fontSize: "24px", fontWeight: 600, marginBottom: "10px" },
    subtitle: { fontSize: "14px", color: "#71717a", marginBottom: "30px", lineHeight: "1.5" },
    form: { display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" },
    inputGroup: { display: "flex", flexDirection: "column" },
    label: { fontSize: "14px", marginBottom: "5px", fontWeight: 600, marginLeft: "6px" },
    input: { padding: "14px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px" },
    submitBtn: { padding: "14px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "16px", mt: "10px" },
    backText: { marginTop: "30px", fontSize: "14px", color: "#71717a", cursor: "pointer", fontWeight: 500 },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "6px" },
    backBtn: { padding: "10px" },
};

export default ResetPassword;
