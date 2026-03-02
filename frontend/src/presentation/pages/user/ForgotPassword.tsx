import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setIsLoading(true);
        try {
            await authApi.forgotPassword(email);
            toast.success("Password reset instructions sent to your email!");
            // We usually go to reset-password or OTP page depending on flow
            // assuming we go to reset-password which takes an OTP and new password
            navigate("/reset-password", { state: { email } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageCenter}>
            <div style={styles.container}>
                <h2 style={styles.title}>Forgot Password?</h2>
                <p style={styles.subtitle}>
                    Enter your registered email address and we'll send you instructions to reset your password.
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <Input
                        label="Email Address"
                        name="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                        placeholder="john.doe@example.com"
                        type="email"
                        error={error}
                    />

                    <button type="submit" style={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Instructions"}
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
    form: { display: "flex", flexDirection: "column", gap: "25px", textAlign: "left" },
    inputGroup: { display: "flex", flexDirection: "column" },
    label: { fontSize: "14px", marginBottom: "5px", fontWeight: 600, marginLeft: "6px" },
    input: { padding: "14px", borderRadius: "10px", backgroundColor: "#fafafa", fontSize: "13px" },
    submitBtn: { padding: "14px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "16px" },
    backText: { marginTop: "30px", fontSize: "14px", color: "#71717a", cursor: "pointer", fontWeight: 500 },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "6px" },
};

export default ForgotPassword;
