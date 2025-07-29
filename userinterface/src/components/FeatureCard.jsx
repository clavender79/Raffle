import Image from 'next/image';

const FeatureCard = ({ title, description, className = '', paraClasses= 'w-50',imgSrc,imgAlt, imgWidth='170', imgHeight='170' } ) => {
  return (
    <div className={` bg-opacity-70 rounded-lg p-8 text-white ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-md tracking-wide ${paraClasses}`}>{description}</p>
      <Image src={imgSrc} alt={imgAlt} width={imgWidth} height={imgHeight} className='object-fit absolute z-20 bottom-0 right-0' ></Image>
    </div>
  );
};

export default FeatureCard;