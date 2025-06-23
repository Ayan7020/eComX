"use client";

import { Pencil, WandSparkles, X } from "lucide-react";
import { useState } from "react";
import Image from 'next/image';

const ImagePlaceHolder = ({ size, small, onImageChange, onRemove, defaultImage = null, index = null, setOpenImageModal }:
    {
        size: string;
        small?: boolean;
        onImageChange: (file: File | null, index: number) => void;
        onRemove?: (index: number) => void;
        defaultImage?: string | null;
        setOpenImageModal: (openImageModel: boolean) => void;
        index?: any;
    }
) => {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

    const handleFilechange = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0]; 
        if (file) { 
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index!)
        }
    }
    return (
        <div className={`relative ${small ? "h-[180px]" : "h-[450px]"} w-full cursor-pointer bg-[#1e1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}>
            <input type="file" accept="image/*" className="hidden" id={`image-upload-${index}`} onChange={handleFilechange} />
            {imagePreview ? (
                <>
                    <button type="button" onClick={() => onRemove?.(index!)} className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg">
                        <X size={16} />
                    </button>
                    <button type="button" onClick={() => setOpenImageModal(true)} className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer">
                        <WandSparkles size={16} />
                    </button>
                </>
            ) : (
                <label htmlFor={`image-upload-${index}`} className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer">
                    <Pencil size={16} />
                </label>
            )}
            {imagePreview ? (
                <Image width={400} height={300} src={imagePreview} alt="uploaded" className="w-full h-full object-cover rounded-lg" />
            ) : (
                <>
                    <p className={`text-gray-400 ${small ? "text-xl" : "text-4xl"} font-semibold`}>{size}</p>
                    <p className={`text-gray-500 ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
                        Please choose an Image <br />
                        according to the expected ratio
                    </p>
                </>
            )}
        </div>
    )
}

export default ImagePlaceHolder;    