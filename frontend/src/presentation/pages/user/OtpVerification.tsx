import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRepositories } from "../../../infrastructure/context/RepositoryContext";
import toast from "react-hot-toast";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../core/constants/Messages";

const OtpVerification: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authRepository } = useRepositories();
    const { email, type, backPath, role } = location.state || {};

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            toast.error("Please enter complete OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const result = await authRepository.verifyOtp({ email, otp: enteredOtp });
            const { token, refreshToken, role: userRole, user } = result;

            if (token) {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("refreshToken", refreshToken);
                sessionStorage.setItem("userRole", userRole || role || "user");
                sessionStorage.setItem("userData", JSON.stringify(user));
                toast.success(SUCCESS_MESSAGES.VERIFICATION_SUCCESS);
                if (userRole === 'admin' || role === 'admin') navigate("/admin/dashboard");
                else if (userRole === 'vendor' || role === 'vendor') navigate("/vendor/dashboard");
                else navigate("/");
            } else {
                toast.success(SUCCESS_MESSAGES.VERIFICATION_SUCCESS);
                navigate("/login");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.INVALID_OTP);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        setIsResending(true);
        try {
            await authRepository.resendOtp(email);
            toast.success(SUCCESS_MESSAGES.OTP_SENT);
            setTimeLeft(60);
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.DEFAULT);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div style={styles.pageCenter}>
            <div style={styles.container}>
                <h2 style={styles.title}>Verify Email</h2>
                <p style={styles.subtitle}>
                    We've sent a 6-digit code to <br />
                    <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerify} style={styles.form}>
                    <div style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                style={styles.otpInput}
                            />
                        ))}
                    </div>

                    <button type="submit" style={styles.verifyBtn} disabled={isVerifying}>
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div style={styles.resendContainer}>
                    {timeLeft > 0 ? (
                        <p style={styles.resendText}>Resend code in {timeLeft}s</p>
                    ) : (
                        <button
                            onClick={handleResend}
                            style={styles.resendBtn}
                            disabled={isResending}
                        >
                            {isResending ? "Sending..." : "Resend OTP"}
                        </button>
                    )}
                </div>

                <p style={styles.backText} onClick={() => navigate(backPath || "/login")}>
                    ← Back to {type === "signup" ? "Sign Up" : "Login"}
                </p>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    pageCenter: { backgroundColor: "#f5f6f8", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
    container: { backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center" },
    title: { fontSize: "24px", fontWeight: 600, marginBottom: "10px" },
    subtitle: { fontSize: "14px", color: "#71717a", marginBottom: "30px", lineHeight: "1.5" },
    form: { display: "flex", flexDirection: "column", gap: "25px" },
    otpContainer: { display: "flex", justifyContent: "center", gap: "10px" },
    otpInput: { width: "45px", height: "55px", fontSize: "22px", textAlign: "center", border: "1px solid #c2c2c2", borderRadius: "10px", backgroundColor: "#fafafa" },
    verifyBtn: { padding: "14px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "16px" },
    resendContainer: { marginTop: "20px" },
    resendText: { fontSize: "14px", color: "#a1a1aa" },
    resendBtn: { background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
    backText: { marginTop: "30px", fontSize: "14px", color: "#71717a", cursor: "pointer", fontWeight: 500 }
};

export default OtpVerification;
