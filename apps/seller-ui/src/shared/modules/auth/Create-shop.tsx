import { useMutation } from "@tanstack/react-query";
import { ShopCategories } from "apps/seller-ui/src/utils/Catgories";
import axios from "axios";
import { useForm } from "react-hook-form";


const Page = ({ sellerId, setActiveStep }: { sellerId: string, setActiveStep: (step: number) => void }) => {

    const { register, handleSubmit, formState: { errors } } = useForm();

    const shopCreationMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`, data);
            return response.data;
        },
        onSuccess: () => {
            setActiveStep(3);
        },
    })

    const onSubmit = (data: any) => {
        const shopData = { ...data, sellerId };
        shopCreationMutation.mutate(shopData);
    }

    return (
        <div >
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold mb-4">
                    Setup New Shop
                </h3>
                <label className="block text-gray-700 mb-1">Name *</label>
                <input
                    type="text"
                    placeholder="John"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('name', {
                        required: "Name is required",
                    })}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
                )}
                <label className="block text-gray-700 mb-1">Bio (Max 100 Word)*</label>
                <input
                    type="text"
                    placeholder="Shop Bio"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('bio', {
                        required: "Shop Bio is required",
                        validate: (value) =>
                            value.trim().split(/\s+/).length <= 100 || "Bio must be 100 words or less",

                    })}
                />
                {errors.bio && (
                    <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
                )}
                <label className="block text-gray-700 mb-1">Address*</label>
                <input
                    type="text"
                    placeholder="Shop Location"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('address', {
                        required: "Shop address is required",
                    })}
                />
                {errors.address && (
                    <p className="text-red-500 text-sm">{String(errors.address.message)}</p>
                )}
                <label className="block text-gray-700 mb-1">Opening Hours*</label>
                <input
                    type="text"
                    placeholder="eg,Mon-Fri 9AM - 6PM"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('openning_hours', {
                        required: "Openning Hours is required",
                    })}
                />
                {errors.openning_hours && (
                    <p className="text-red-500 text-sm">{String(errors.openning_hours.message)}</p>
                )}
                <label className="block text-gray-700 mb-1">Website</label>
                <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('website', {
                        pattern: {
                            value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- .\/?%&=]*)?$/,
                            message: "Please enter a valid URL",
                        }
                    })}
                />
                {errors.website && (
                    <p className="text-red-500 text-sm">{String(errors.website.message)}</p>
                )}
                <label className="block text-gray-700 mb-1">Select a Category</label>
                <select className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register('category', { required: "Category is required" })}>
                    <option value="">Select a Category</option>
                    {ShopCategories.map((category) => (
                        <option key={category?.value} value={category?.value}>
                            {category?.label}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-red-500 text-sm">{String(errors.category.message)}</p>
                )}
                <button type="submit" className="w-full text-lg bg-blue-600 text-white py-2 mt-4 rounded-lg flex items-center justify-center">
                    Create Shop
                </button>
            </form>
        </div>
    );
}

export default Page;