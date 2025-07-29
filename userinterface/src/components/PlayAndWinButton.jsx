import React from 'react';

const PlayAndWinButton = () => {
  return (
    <div className="flex flex-col items-center mt-4 text-white">
      <h2 className="text-2xl font-bold">Play & Win</h2>
      <button className="mt-2 px-6 py-3 bg-gradient-to-r from-[#ffffffeb] via-[#73C5FF] to-[#73C5FF] text-black rounded-full">
        Buy your tickets
      </button>
    </div>
  );
};

export default PlayAndWinButton;