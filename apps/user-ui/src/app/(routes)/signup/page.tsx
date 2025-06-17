"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import GoogleButton from "../../../shared/components/google-button"
import { Eye, EyeClosed, LoaderCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
    email: string;
    password: string;
    name: string;
}

const Page = () => {
    const [passwordVisible, setpasswordVisible] = useState(false);
    const [canResend, setcanResend] = useState(false);
    const [timer, setTimer] = useState(60);
    const [showOtp, setshowOtp] = useState(false)
    const [otp, setotp] = useState(["", "", "", ""])
    const [userData, setUserData] = useState<FormData | null>(null)
    const inputRef = useRef<(HTMLInputElement | null)[]>([])


    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const startResendTimer = () => {
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

    const signUpMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`, data);
            return response.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData)
            setshowOtp(true);
            setcanResend(false);
            setTimer(60)
            startResendTimer();
        }
    });

    const veriFyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`, {
                ...userData,
                otp: otp.join(""),
            });
            return response.data;
        },
        onSuccess: () => {
            router.push("/login")
        }
    });

    const onSubmit = (data: FormData) => {
        signUpMutation.mutate(data)
    };

    const resendOtp = () => {
        if (userData){
            signUpMutation.mutate(userData)
        }
    }
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
    return <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
        <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
            Signup
        </h1>
        <p className="text-center text-lg font-medium py-3 text-[#00000099]">
            Home . Signup
        </p>
        <div className="w-full flex justify-center">
            <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
                <h3 className="text-3xl font-semibold text-center mb-2">Signup to EComX</h3>
                <p className="text-center  text-gray-500 mb-4">
                    Already have an account?
                    <Link href={"/login"} className="text-blue-500 hover:underline">Login</Link>
                </p>
                <GoogleButton />
                <div className="flex items-center my-5  text-gray-400 text-sm">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="px-3">Or Sign up with Email</span>
                    <div className="flex-1 border-t border-gray-300" />
                </div>
                {!showOtp ? (<form onSubmit={handleSubmit(onSubmit)}>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        placeholder="John"
                        className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                        {...register('name', {
                            required: "Name is required",
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
                    )}
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
                    <label className="block text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Min 6 Char"
                            className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                            {...register('password', {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                        />
                        <button type="button" onClick={() => setpasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                            {passwordVisible ? <Eye /> : <EyeClosed />}
                        </button>
                        {errors.password && (
                            <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                        )}
                    </div>
                    <button type="submit" disabled={signUpMutation.isPending} className="w-full text-lg  mt-4 cursor-pointer bg-black text-white py-2 rounded-lg flex items-center justify-center">
                        {signUpMutation.isPending ? <LoaderCircle className="animate-spin" /> : "Sign Up"}
                    </button>
                    {
                        signUpMutation?.isError &&
                        signUpMutation.error instanceof AxiosError && (
                            <p className="text-red-800 text-sm mt-2 p-4 rounded-xl" style={{ backgroundColor: "rgba(220, 38, 38, 0.3)" }}>
                                {signUpMutation.error.response?.data?.message || signUpMutation.error.message}
                            </p>
                        )
                    }
                </form>) : (
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
                        {
                            veriFyOtpMutation?.isError &&
                            veriFyOtpMutation.error instanceof AxiosError && (
                                <p className="text-red-500 text-sm mt-2">
                                    {veriFyOtpMutation.error.response?.data?.message || veriFyOtpMutation.error.message}
                                </p>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    </div>
}

export default Page;