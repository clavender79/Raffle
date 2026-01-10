import CreateLotteriesButton from './CreateLotteriesButton';

const AddMoreLotteries = () => {
    return (
        <div className='flex flex-col items-center justify-center mt-12'>
            <p className='text-xl font-bold'>Add More Lotteries</p>
            <p className='text-[#949494] mb-4'>Create and launch new opportunities for players</p>

            <CreateLotteriesButton></CreateLotteriesButton>
           
        </div>
    );
}

export default AddMoreLotteries;
