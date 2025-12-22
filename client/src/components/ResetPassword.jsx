import React, { useContext, useState, useEffect } from "react";
import { Mail, Lock, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputField from "./ui/InputField";
import { AppContent } from "./context/AppContext";
import { message } from "antd";
import Loading from "./ui/Loading";
import { Link } from "react-router-dom";

/**
 * ResetPassword component with email verification via OTP and password reset.
 */
const ResetPassword = () => {
    const { backendUrl } = useContext(AppContent);

    /* -------------------------------------------------------------------------- */
    /*                                 Form States                                */
    /* -------------------------------------------------------------------------- */
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    /* -------------------------------------------------------------------------- */
    /*                             Verification States                            */
    /* -------------------------------------------------------------------------- */
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* -------------------------------------------------------------------------- */
    /*                            Password Validation                             */
    /* -------------------------------------------------------------------------- */
    const validations = {
        hasMinLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
    const isValidPassword = Object.values(validations).every(Boolean);

    /* -------------------------------------------------------------------------- */
    /*                             OTP Expiry Countdown                           */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, step]);

    /* -------------------------------------------------------------------------- */
    /*                              Resend Countdown                              */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        if (!resendDisabled || countdown <= 0) {
            setResendDisabled(false);
            return;
        }
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, resendDisabled]);

    /* -------------------------------------------------------------------------- */
    /*                            Send Reset OTP Handler                          */
    /* -------------------------------------------------------------------------- */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${backendUrl}/api/auth/send-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            

            const data = await response.json().catch(() => ({ message: "Failed to send OTP" }));

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setSuccess("OTP sent to your email!");
            message.success("OTP sent to your email!");
            setStep(2);
            setTimeLeft(300); // Reset timer
            setError("");
        } catch (error) {
            const errorMessage = error.message || "Failed to send OTP";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                               OTP Input Handler                            */
    /* -------------------------------------------------------------------------- */
    const handleOtpChange = (index, value, event) => {
        if (!/^\d?$/.test(value)) return;

        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        } else if (event.key === "Backspace" && !value && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const digits = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)
            .split("");
        setOtp([...digits, ...Array(6 - digits.length).fill("")]);
        const nextIndex = digits.length < 6 ? digits.length : 5;
        document.getElementById(`otp-${nextIndex}`)?.focus();
    };

    /* -------------------------------------------------------------------------- */
    /*                              OTP Verify Handler                            */
    /* -------------------------------------------------------------------------- */
    const handleVerifyOtp = async () => {
        setError("");
        setSuccess("");
        const enteredOtp = otp.join("");

        if (enteredOtp.length < 6) {
            setError("Please enter the full 6-digit OTP.");
            message.error("Please enter the full 6-digit OTP.");
            return;
        }
        if (timeLeft <= 0) {
            setError("OTP has expired. Please request a new one.");
            message.error("OTP has expired. Please request a new one.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${backendUrl}/api/auth/verify-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp }),
            });

            const data = await response.json().catch(() => ({ message: "Verification failed" }));
            if (!response.ok) throw new Error(data.message || "Verification failed");

            setSuccess("OTP verified! Now set your new password.");
            message.success("OTP verified! Now set your new password.");
            setStep(3);
            setError("");
        } catch (error) {
            const errorMessage = error.message || "Invalid OTP. Try again.";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                              Resend OTP Handler                            */
    /* -------------------------------------------------------------------------- */
    const handleResendOtp = async () => {
        setResendDisabled(true);
        setCountdown(30);
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`${backendUrl}/api/auth/send-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const data = await response.json().catch(() => ({ message: "Resend failed" }));
            if (!response.ok) throw new Error(data.message || "Resend failed");

            setTimeLeft(300);
            setSuccess("New OTP sent!");
            message.success("New OTP sent!");
            setError("");
        } catch (error) {
            const errorMessage = error.message || "Failed to resend OTP.";
            setError(errorMessage);
            message.error(errorMessage);
            setResendDisabled(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                            Reset Password Handler                          */
    /* -------------------------------------------------------------------------- */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!isValidPassword) {
            const errorMsg = "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.";
            setError(errorMsg);
            message.error(errorMsg);
            return;
        }

        setIsLoading(true);

        try {
            const enteredOtp = otp.join("");
            const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp: enteredOtp,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json().catch(() => ({ message: "Password reset failed" }));
            if (!response.ok) throw new Error(data.message || "Password reset failed");

            setSuccess("Password reset successfully! Redirecting to login...");
            message.success("Password reset successfully! Redirecting to login...");
            setError("");
            setTimeout(() => (window.location.href = "/login"), 2000);
        } catch (error) {
            const errorMessage = error.message || "Failed to reset password.";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                               Utility Functions                            */
    /* -------------------------------------------------------------------------- */
    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    /* -------------------------------------------------------------------------- */
    /*                              Validation Icon                               */
    /* -------------------------------------------------------------------------- */
    const ValidationIcon = ({ isValid }) => (
        <span className={isValid ? "text-green-500" : "text-red-500"}>
            {isValid ? <Check size={14} /> : <X size={14} />}
        </span>
    );

    /* -------------------------------------------------------------------------- */
    /*                                 JSX Return                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="flex items-center justify-center pb-28 pt-[100px]">
            <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <>
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 sm:p-4 rounded-full shadow-md inline-block">
                                    <Lock size={24} className="text-white sm:h-8 sm:w-8" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">Reset Password</h2>
                                <p className="text-gray-500 mt-2 text-xs sm:text-sm">Enter your email to receive a verification code</p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-3 sm:space-y-4">
                                <InputField
                                    id="email"
                                    label="Email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    icon={<Mail className="w-5 h-5 text-gray-400" />}
                                    required
                                    autoComplete="email"
                                    className="text-sm sm:text-base"
                                    error={error}
                                />

                                {success && <p className="text-green-600 text-sm">{success}</p>}
                                {error && !email && <p className="text-red-600 text-sm">{error}</p>}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending OTP..." : "Send OTP"}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 sm:p-4 rounded-full shadow-md inline-block">
                                    <Mail size={24} className="text-white sm:h-8 sm:w-8" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">Verify Your Email</h1>
                                <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                                    Enter the 6-digit code sent to{" "}
                                    <span className="text-blue-600 font-semibold">{email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6" onPaste={handleOtpPaste}>
                                {otp.map((digit, idx) => (
                                    <InputField
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value, e)}
                                        onKeyDown={(e) => handleOtpChange(idx, e.target.value, e)}
                                        className="w-10 h-10 sm:w-14 sm:h-14 text-lg sm:text-2xl font-bold text-center border-2 rounded-lg"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            <p
                                className={`text-center text-xs sm:text-sm ${timeLeft < 60 ? "text-red-500" : "text-gray-500"} mb-4 sm:mb-6`}
                            >
                                {timeLeft > 0
                                    ? `Code expires in ${formatTime(timeLeft)}`
                                    : "Code has expired. Please request a new one."}
                            </p>

                            {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}
                            {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                            <Button
                                onClick={handleVerifyOtp}
                                disabled={isLoading || timeLeft <= 0}
                                className="w-full h-10 sm:h-12 mb-3 sm:mb-4 text-sm sm:text-base"
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </Button>

                            <div className="text-xs sm:text-sm text-center text-gray-600 mb-4">
                                Didn't receive the code?{" "}
                                {resendDisabled ? (
                                    <span className="text-blue-600">Resend available in {countdown}s</span>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setOtp(["", "", "", "", "", ""]);
                                        setTimeLeft(300);
                                        setResendDisabled(false);
                                        setCountdown(30);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    <ArrowLeft size={16} />
                                    Change Email
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Set New Password */}
                    {step === 3 && (
                        <>
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="bg-gradient-to-br from-green-400 to-green-500 p-3 sm:p-4 rounded-full shadow-md inline-block">
                                    <Lock size={24} className="text-white sm:h-8 sm:w-8" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">Set New Password</h1>
                                <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                                    Create a strong password for your account
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4">
                                <InputField
                                    id="newPassword"
                                    label="New Password"
                                    type={isPasswordShown ? "text" : "password"}
                                    placeholder="Enter New Password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setError("");
                                    }}
                                    onFocus={() => setShowPasswordRequirements(true)}
                                    onBlur={() => newPassword.length === 0 && setShowPasswordRequirements(false)}
                                    icon={<Lock className="w-5 h-5 text-gray-400" />}
                                    isPasswordShown={isPasswordShown}
                                    togglePasswordVisibility={() => setIsPasswordShown((prev) => !prev)}
                                    required
                                    autoComplete="new-password"
                                    className="text-sm sm:text-base"
                                    error={error}
                                />

                                {showPasswordRequirements && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1 text-xs sm:text-sm">
                                        <p className="font-medium text-gray-500">Password must contain:</p>
                                        {Object.entries({
                                            "At least 8 characters": validations.hasMinLength,
                                            "At least one uppercase letter": validations.hasUppercase,
                                            "At least one lowercase letter": validations.hasLowercase,
                                            "At least one number": validations.hasNumber,
                                            "At least one special character": validations.hasSpecialChar,
                                        }).map(([text, valid], idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <ValidationIcon isValid={valid} />
                                                <span className={valid ? "text-green-500" : "text-gray-500"}>{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {success && <p className="text-green-600 text-sm">{success}</p>}
                                {error && <p className="text-red-600 text-sm">{error}</p>}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12"
                                    disabled={!isValidPassword || isLoading}
                                >
                                    {isLoading ? "Resetting Password..." : "Reset Password"}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {isLoading && (
                    <Loading
                        text={
                            step === 1
                                ? "Sending OTP..."
                                : step === 2
                                ? "Verifying OTP..."
                                : "Resetting password..."
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default ResetPassword;

