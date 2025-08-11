"use client"

import { Search, ListFilter  } from "lucide-react"

export default function LotterySearchFilter({ searchTerm, onSearchChange, onFilterClick, className='', inputClassName='', FilterClassName='', structureClassName='' }) {
  return (

      <div className={`flex gap-3 ${structureClassName}`}>

        <div className={`relative flex items-center  border-2 rounded-3xl ${className}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 placeholder:text-gray-400 w-64 text-black outline-none focus:outline-none focus:ring-0 focus:border-none ${inputClassName}`}
          />
        </div>

        <button
          variant="outline"
          onClick={onFilterClick}
          className={`border-2 rounded-3xl flex items-center p-2 px-4 ${FilterClassName} flex gap-2`}
        >
          <ListFilter />
          Filter
        </button>


      </div>
   
  )
}
