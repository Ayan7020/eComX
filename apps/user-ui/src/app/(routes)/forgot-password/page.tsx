"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
    email: string;
    password: string;
}

const Page = () => {
    const [step, setstep] = useState<"email" | "otp" | "reset">("email");
    const [otp, setotp] = useState(["", "", "", ""]);
    const [userEmail, setuserEmail] = useState<string | null>(null);
    const [canResend, setcanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [serverError, setserverError] = useState<string | null>(null);
    const inputRef = useRef<(HTMLInputElement | null)[]>([])

    const router = useRouter();

    const startResendTimer = () => {
        setTimer(60);
        setcanResend(false);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setcanResend(true);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)
    }
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();


    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`, { email });
            return response.data;
        },
        onSuccess: (_, { email }) => {
            setuserEmail(email);
            setstep("otp");
            setserverError(null)
            startResendTimer()
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid Email"
            setserverError(errorMessage)
        }
    })

    const veriFyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`, { email: userEmail, otp: otp.join("") });
            return response.data;
        },
        onSuccess: () => {
            setstep("reset");
            setserverError(null)
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid Email"
            setserverError(errorMessage)
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`, { email: userEmail, newPassword: password });
            return response.data;
        },
        onSuccess: () => {
            setstep("email");
            setserverError(null);
            router.push("/login")
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid Email"
            setserverError(errorMessage)
        }
    })

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setotp(newOtp);
        if (value && index < inputRef.current.length - 1) {
            console.log(inputRef.current.length)
            inputRef.current[index + 1]?.focus()
        }
    }
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRef.current[index - 1]?.focus()
        }
    }
    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email })
    };

    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password })
    };
    const resendOtp = () => {
    }

    return <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
        <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
            Forgot Password
        </h1>
        <p className="text-center text-lg font-medium py-3 text-[#00000099]">
            Home . Forgot-Password
        </p>
        <div className="w-full flex justify-center">
            <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
                {step === "email" && (
                    <>
                        <form onSubmit={handleSubmit(onSubmitEmail)}>
                            <label className="block text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="JohnDoe@gmail.com"
                                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                                {...register('email', {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address"
                                    }
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
                            )}
                            <button type="submit" disabled={requestOtpMutation.isPending} className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg flex justify-center">
                                {requestOtpMutation.isPending ? <LoaderCircle className="animate-spin" /> : "Send OTP"}
                            </button>
                            {serverError && (
                                <p className="text-red-500 text-sm mt-2">{serverError}</p>
                            )}
                        </form>
                    </>
                )}
                {step === "otp" && (
                    <>
                        <div>
                            <h3 className="text-xl font-semibold text-center mb-4">Enter Otp</h3>
                            <div className="flex justify-center gap-6">
                                {otp?.map((digit, index) => (
                                    <input type="text" key={index} ref={(el) => {
                                        if (el) inputRef.current[index] = el;
                                    }}
                                        maxLength={1}
                                        className="w-12 h-12 text-center border  border-gray-300 outline-none !rounded"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                            <button disabled={veriFyOtpMutation.isPending} onClick={() => veriFyOtpMutation.mutate()} className="w-full text-lg  mt-4 cursor-pointer bg-blue-500 text-white py-2 rounded-lg">
                                {veriFyOtpMutation.isPending ? <LoaderCircle className="animate-spin" /> : "Verify OTP"}
                            </button>
                            <p className="text-center text-sm mt-4">
                                {
                                    canResend ? (
                                        <button className="cursor-pointer text-blue-500" onClick={resendOtp}>
                                            Resend Otp
                                        </button>
                                    ) : (
                                        `Resend OTP in ${timer}s`
                                    )
                                }
                            </p>
                            {serverError &&
                                <p className="text-red-500 text-sm mt-2">
                                    {serverError}
                                </p>
                            }
                        </div>
                    </>
                )}
                {step === "reset" && (
                    <>
                        <h3 className="text-xl font-semibold text-center mb-4">Reset Password</h3>
                        <form onSubmit={handleSubmit(onSubmitPassword)}>
                            <label className="block text-gray-700 mb-1">New Password</label>
                            <input
                                type={"password"}
                                placeholder="Enter new password"
                                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                                {...register('password', {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                            )}
                            <button type="submit" disabled={resetPasswordMutation.isPending} className="w-full text-lg  mt-4 cursor-pointer bg-black text-white py-2 rounded-lg flex items-center justify-center">
                                {resetPasswordMutation.isPending ? <LoaderCircle className="animate-spin" /> : "Reset Password"}
                            </button>
                            {serverError &&
                                <p className="text-red-500 text-sm mt-2">
                                    {serverError}
                                </p>
                            }
                        </form>
                    </>
                )}
            </div>
        </div>
    </div>
}

export default Page;