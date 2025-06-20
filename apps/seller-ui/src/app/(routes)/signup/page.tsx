"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeClosed, LoaderCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { countries } from "apps/seller-ui/src/utils/countries";

type FormData = {
  email: string;
  password: string;
  phone_number: string;
  name: string;
  country: any;
}

const Page = () => {
  const [passwordVisible, setpasswordVisible] = useState(false);
  const [canResend, setcanResend] = useState(false);
  const [sellerId, setSellerId] = useState("");
  const [timer, setTimer] = useState(60);
  const [showOtp, setshowOtp] = useState(false)
  const [otp, setotp] = useState(["", "", "", ""])
  const [sellerData, setsellerData] = useState<FormData | null>(null)
  const inputRef = useRef<(HTMLInputElement | null)[]>([])
  const [activeStep, setActiveStep] = useState(1);

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data);
      return response.data;
    },
    onSuccess: (_, formData) => {
      setsellerData(formData)
      setshowOtp(true);
      setcanResend(false);
      setTimer(60)
      startResendTimer();
    }
  });

  const veriFyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller-registration`, {
        ...sellerData,
        otp: otp.join(""),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id)
      setActiveStep(2);
    }
  });

  const onSubmit = (data: FormData) => {
    signUpMutation.mutate(data)
  };

  const resendOtp = () => {
    if (sellerData) {
      signUpMutation.mutate(sellerData)
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
  return <div className="w-full flex flex-col items-center pt-10 min-h-screen">
    <div className="relative flex items-center justify-between md:w-[50%] mb-8">
      <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
      {[1, 2, 3].map((step) => (
        <div key={step}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`}>
            {step}
          </div>
          <span className="ml-[-15px]">
            {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}
          </span>
        </div>
      ))}
    </div>
    <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
      {activeStep === 1 && (
        <>
          {!showOtp ? (<form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="text-2xl font-semibold text-center mb-4">
              Create Account
            </h3>
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
            <label className="block text-gray-700 mb-1">Mobile No</label>
            <input
              type="tel"
              placeholder="86230*****"
              className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
              {...register('phone_number', {
                required: "Phone Number is required",
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: "Invalid phone number format"
                },
                minLength: {
                  value: 10,
                  message: "Phone number must be at least 10 digits"
                },
                maxLength: {
                  value: 10,
                  message: "Phone number must not exceed 10 digits"
                }
              })}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm">{String(errors.phone_number.message)}</p>
            )}

            <label className="block text-gray-700 mb-1">Country</label>
            <select className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
              {...register('country', { required: "Country is required" })}>
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country?.code} value={country?.code}>
                  {country?.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm">{String(errors.country.message)}</p>
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
            <p className="text-center pt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500">Login</Link>
            </p>
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
        </>
      )}
    </div>
  </div>
}

export default Page;