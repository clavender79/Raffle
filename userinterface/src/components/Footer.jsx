
import Image from 'next/image';

const Footer = () => {
  return (
    <div className="text-center text-white  w-80 mx-auto px-4 mt-20 ">

      <div className='flex items-center justify-center gap-2 mb-4'>

      <Image src='Logo.svg' alt='logo' width={30} height={30} ></Image>
      <p className="text-md font-semibold"> RaffleRun</p>
      </div>
      <p className="text-sm mb-4 text-[#FFFFFFCC]">
        Where transparency meets opportunity. Join the future of play and win with confidence.
      </p>
      <div className="mt-2 text-sm px-2 text-[#73C5FF] font-medium">
        <a href="#" className="mr-2">Twitter</a>  <a href="#" className="mx-2">Instagram</a> {' '}
        <a href="#" className="mx-2">Facebook</a> {' '}
        <a href="#" className="ml-2">Whitepaper</a>  <a href="#">Smart Contracts</a> {' '}
        <a href="#">Resources</a>
      </div>
    </div>
  );
};

export default Footer;