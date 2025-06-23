'use client';

import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";


const Page = () => {

    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        console.log(data)
    }
    return (
        <form className="w-full mx-auto p-8 shadow-md rounded-lg text-white" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
                Create Product
            </h2>
            <div className="flex items-center">
                <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                <ChevronRight/>
            </div>
        </form>
    );
}
export default Page;