// src/components/AdminTable.jsx
"use client";

import { useRouter } from "next/navigation";


const AdminTable = ({ headers, data, lastColumnType = null, tbodyClassName='' , tablepaddingX='px-8' }) => {

    const router = useRouter();
   

    // Clone headers so we don't mutate props
    const alignedHeaders = [...headers];

    if(lastColumnType==="history") {
   
        alignedHeaders.push('\u00A0'); // non-breaking space
    }
   
    // Determine the key for the last column based on type
    const getLastColumnContent = (row, index) => {
        if (!lastColumnType) return row[Object.keys(row)[Object.keys(row).length - 1]];

        if (lastColumnType === "status") {
            const status = row.status || "Unknown";
            const color = status === "Closed" ? "bg-[#A20000] border-[#FF4C4F]" : status === "Open" ? "bg-[#1EA200] border-[#32EE08]" : "";
            return <span className={`inline-block py-1 px-2 rounded-2xl border ${color}`}>{status}</span>;
        }

        if (lastColumnType === "history") {
          
            const lotteryId = row["id"];
            return (
                <button onClick={() => router.push(`/admin/history/${lotteryId}`)} className="px-2 py-1 bg-[#0067A2] text-white border border-[#73C5FF] rounded-3xl">
                    history
                </button>
            );
        }

        return row[Object.keys(row)[Object.keys(row).length - 1]]; // Default to last value
    };

    return (
        <div className= {`overflow-x-auto border border-[#383838] rounded-2xl ${tbodyClassName} `}>
            <table className="w-full border-collapse  ">
                {/* Table Header */}
                <thead className="bg-[#101010] sticky top-0">
                    <tr>
                        {alignedHeaders.map((header, index) => (
                            <th
                                key={index}
                                className={`bg-[#101010] text-white pt-2 pb-4 ${tablepaddingX} text-left`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Table Body */}
                <tbody  >
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`${rowIndex % 2 === 0 ? "bg-[#101010]" : "bg-black"
                                } text-white `}
                        >
                            {Object.values(row)
                                .slice(0, lastColumnType === "status" ? -1 : undefined) // Exclude last column if special
                                .map((value, cellIndex) => (
                                    <td key={cellIndex} className={`py-2 ${tablepaddingX}`}>
                                        {value}
                                    </td>
                                ))}
                            {/* Last Column (Special Handling) */}
                            {lastColumnType && (
                                <td className="p-2 ps-8">
                                    {getLastColumnContent(row, rowIndex)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;