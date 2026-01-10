"use client"
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreateLotteriesButton = ({ className =""}) => {

  const router = useRouter();

  const handleClick = () => {

    router.push('/admin/create');
  }
    

    return (
         <button
                     variant="outline"
                     onClick={handleClick}
                     className={`border-2 rounded-3xl flex items-center p-2 px-4 text-black gap-2 bg-white hover:bg-gray-200 ${className}`}
                   >
                     <Plus />
                     Create Lottery
                   </button>
    );
}

export default CreateLotteriesButton;
