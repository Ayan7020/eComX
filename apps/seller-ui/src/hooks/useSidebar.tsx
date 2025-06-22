"use client";


import { useAtom } from 'jotai';
import { activeSidebarItem } from '../configs/constant';

const useSidebar = () => {
    const [activeSidebar, setactivesidebar] = useAtom(activeSidebarItem); 

    return {
        activeSidebar,
        setactivesidebar,
    };
}

export default useSidebar;