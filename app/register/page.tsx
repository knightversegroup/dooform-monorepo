"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";
    const { updateUser, isAuthenticated, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, authLoading, router, redirectTo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (): string | null => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            return "กรุณากรอกข้อมูลให้ครบถ้วน";
        }

        if (!formData.email.includes("@")) {
            return "กรุณากรอกอีเมลที่ถูกต้อง";
        }

        if (formData.password.length < 8) {
            return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        }

        if (formData.password !== formData.confirmPassword) {
            return "รหัสผ่านไม่ตรงกัน";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        // Split full name into first and last name
        const nameParts = formData.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: firstName,
                    last_name: lastName,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "การสมัครสมาชิกล้มเหลว");
            }

            setSuccess(true);
        } catch (err) {
            console.error("Register error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "เกิดข้อผิดพลาดในการสมัครสมาชิก"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError(null);
        setGoogleLoading(true);

        try {
            // Sign in with Firebase Google popup
            const result = await signInWithPopup(auth, googleProvider);

            // Get the ID token
            const idToken = await result.user.getIdToken();

            // Send ID token to our backend
            const response = await fetch(`${API_BASE_URL}/auth/google/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_token: idToken }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Google authentication failed");
            }

            // Store tokens in localStorage
            const authData = {
                user: data.data.user,
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
            };

            localStorage.setItem("dooform_auth", JSON.stringify(authData));

            // Update auth context
            if (data.data.user) {
                updateUser(data.data.user);
            }

            // Check if profile needs to be completed
            if (data.data.user && !data.data.user.profile_completed) {
                router.push("/profile/setup");
            } else {
                router.push(redirectTo);
            }
        } catch (err) {
            console.error("Google register error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "เกิดข้อผิดพลาดในการสมัครด้วย Google"
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-surface-alt flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Success state
    if (success) {
        const loginUrl = redirectTo !== "/" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login";
        return (
            <section className="bg-surface-alt font-sans min-h-screen flex items-center justify-center">
                <div className="container-main section-padding flex flex-col items-center gap-9">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-h2 text-foreground">
                            สมัครสมาชิกสำเร็จ!
                        </h2>
                        <p className="text-body text-text-muted">
                            กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี
                        </p>
                    </div>
                    <Button href={loginUrl} variant="primary">
                        ไปหน้าเข้าสู่ระบบ
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-surface-alt font-sans min-h-screen flex items-center justify-center">
            <div className="container-main section-padding flex flex-col items-center gap-9">
                {/* Header */}
                <div className="flex flex-col items-center gap-0.5 text-center w-full">
                    <h2 className="text-h2 text-foreground">
                        ทดลองใช้งานฟรี
                    </h2>
                    <p className="text-body text-foreground">
                        เพียงสมัครสมาชิกและกรอกข้อมูลได้ทันที
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-[295px]">
                    {/* Input Fields */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <Input
                            type="text"
                            name="fullName"
                            placeholder="ชื่อ – นามสกุล"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={loading || googleLoading}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="อีเมล"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading || googleLoading}
                            required
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="รหัสผ่าน"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading || googleLoading}
                            required
                        />
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="ยืนยันรหัสผ่าน"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading || googleLoading}
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl w-full">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-body-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col items-center gap-3 w-full">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full justify-center"
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังสมัครสมาชิก...
                                </>
                            ) : (
                                "สมัครสมาชิก"
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex-1 h-px bg-border-default"></div>
                            <span className="text-caption text-text-muted">หรือ</span>
                            <div className="flex-1 h-px bg-border-default"></div>
                        </div>

                        {/* Google Register */}
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            disabled={loading || googleLoading}
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            {googleLoading ? "กำลังสมัคร..." : "สมัครด้วย Google"}
                        </button>

                        {/* Login Link */}
                        <div className="flex items-center gap-3">
                            <Button
                                href={redirectTo !== "/" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                                variant="secondary"
                            >
                                มีบัญชีผู้ใช้แล้ว?
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Terms Notice */}
                <p className="text-caption text-text-muted text-center max-w-[295px]">
                    การสมัครสมาชิกถือว่าคุณได้ยินยอมให้มีการเก็บข้อมูลในการใช้งาน
                </p>
            </div>
        </section>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-surface-alt flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            }
        >
            <RegisterContent />
        </Suspense>
    );
}
