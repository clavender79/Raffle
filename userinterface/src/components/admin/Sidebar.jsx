"use client";
import { LayoutGrid, WandSparkles, History } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const Sidebar = () => {
    const [selected, setSelected] = useState("overview");

    return (
        <div className='flex h-[85vh] items-center'>

        
        <div className='flex flex-col  bg-[#202020] rounded-4xl text-white p-1 gap-8  '>
            <Link href="/admin/overview" className={`flex items-center justify-center  rounded-full p-[0.92rem] ${selected === "overview" ? "bg-[#38B4FF] text-white" : "text-white hover:bg-gray-700"}`} onClick={() => setSelected("overview")}>

                <LayoutGrid />

            </Link>

            <Link href="/admin/create" className={`flex items-center justify-center  rounded-full p-[0.92rem] ${selected === "create" ? "bg-[#38B4FF] text-white" : "text-white hover:bg-gray-700"}`} onClick={() => setSelected("create")}>
                <WandSparkles />

            </Link>

            <Link href="/admin/history" className={`flex items-center justify-center  rounded-full p-[0.92rem] ${selected === "history" ? "bg-[#38B4FF] text-white" : "text-white hover:bg-gray-700"}`} onClick={() => setSelected("history")}>

                <History />

            </Link>



        </div>
        </div>
    );
}

export default Sidebar;

