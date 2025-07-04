'use client';

import { AlignLeft, ChevronDown, HeartIcon, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "../../../configs/constants";
import Link from "next/link";
import useUser from "apps/user-ui/src/hooks/useUser";

const HeaderBottom = () => {
    const [show, setshow] = useState(false);
    const [IsSticky, setIsSticky] = useState(false);
    const { user, isLoading } = useUser();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true)
            } else {
                setIsSticky(false)
            }
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return <div className={`w-full transition-all duration-300 ${IsSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
        <div className={`w-[80%] relative m-auto flex items-center justify-between  ${IsSticky ? "pt-3" : "py-0"}`}>
            <div className={`w-[260px] ${IsSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
                onClick={() => setshow(!show)}
            >
                <div className="flex items-center gap-2">
                    <AlignLeft color="white" />
                    <span className="text-white font-medium">All Departments</span>
                </div>
                <ChevronDown color="white" />
            </div>
            {show && (
                <div className={`absolute left-0 ${IsSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5]`}>

                </div>
            )}
            <div className="flex items-center">
                {navItems.map((i: NavitemsTypes, index: number) => (
                    <Link className="px-5 font-medium  text-lg" href={i.href} key={index}>{i.title}</Link>
                ))}
            </div>
            <div>
                {IsSticky && (
                    <div className="flex items-center gap-8 pb-2">
                        <div className="flex items-center gap-2">
                            {!isLoading && user ? (
                                <>
                                    <Link href={"/profile"} className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                                        <User />
                                    </Link>
                                    <Link href={'/profile'}>
                                        <span className="block font-medium">Hello,</span>
                                        <span className="font-semibold">{user?.name?.split(" ")[0]}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={"/login"} className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                                        <User />
                                    </Link>
                                    <Link href={'/login'}>
                                        <span className="block font-medium">Hello,</span>
                                        <span className="font-semibold">{isLoading ? "..." : "SignIn"}</span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-5">
                            <Link href={"/wishlist"} className="relative">
                                <HeartIcon />
                                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full  flex items-center justify-center absolute top-[-10px] right-[-10px]">
                                    <span className="text-white font-medium text-sm">0</span>
                                </div>
                            </Link>
                            <Link href={"/wishlist"} className="relative">
                                <ShoppingBag />
                                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full  flex items-center justify-center absolute top-[-10px] right-[-10px]">
                                    <span className="text-white font-medium text-sm">0</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
}

export default HeaderBottom;