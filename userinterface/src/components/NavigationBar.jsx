import Image from "next/image";
import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton"; // Adjust the import path

const NavigationBar = ({ className = "", navFirstOption, navSecondOption, navThirdOption,path="" }) => {

    
    return (
        <nav className={` flex items-center justify-between px-4 py-0.5 mt-2 text-white ${className}`} >

            <div className="flex items-center">

                <Link href="/">
                    <div className="flex items-center space-x-4">
                        <Image
                            src="/Logo.svg"
                            alt="LuckyChain Logo"
                            width={30}
                            height={30}
                            className="rounded-full"
                        />
                        <span className="text-xl font-bold">LuckyChain</span>
                    </div>
                </Link>

                <div className="flex gap-12 border-l border-white/10 pl-5 ml-6">
                    <Link href={`${path}/${navFirstOption.toLowerCase()}`} className="hover:text-gray-200">
                        {navFirstOption}
                    </Link>
                    <Link href={`${path}/${navSecondOption.toLowerCase()}`} className="hover:text-gray-200">
                        {navSecondOption}
                    </Link>
                    <Link href={`${path}/${navThirdOption.toLowerCase()}`} className="hover:text-gray-200">
                        {navThirdOption}
                    </Link>
                </div>
            </div>
            <div>
                <WalletConnectButton className="bg-white text-black hover:bg-gray-200" />
            </div>
        </nav>
    );
};

export default NavigationBar;