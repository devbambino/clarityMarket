import React from 'react';
import Link from 'next/link';
import { useDisconnect, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { FONT, FONT_BOLD } from "@/fonts/fonts";
import { FaChartLine } from 'react-icons/fa';

export const Navbar = () => {
  const { disconnect } = useDisconnect()
  const { address } = useWeb3ModalAccount()

  return (
    <nav className="flex flex-row w-full align-middle bg-[#3c4e7d] p-4">
      <div className="flex-auto flex items-center space-x-2 text-white">
        <FaChartLine className="text-2xl text-[#F9EB68]" />
        <span className="text-2xl font-bold">Clarity<span className={"text-[#F9EB68] " + FONT_BOLD.className}>Market</span></span>
      </div>
      <button
            onClick={() => disconnect()}
            className={"flex-none flex flex-col my-auto h-fit py-1 px-6 text-base rounded-3xl border-4 border-[#F9EB68] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
          >
            <span>Disconnect</span><span className="text-xs text-white">{address!.slice(0, 12)}...</span>
          </button>
    </nav>
  );

  return (
    <nav className={"text-white my-5 text-xl w-full " + FONT.className}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-end gap-10">
          <img
            className="h-auto max-w-xs"
            src="/logoText.png"
            alt="ClarityMarket, invest with confidence, learn with clarity"
          />
          <button
            onClick={() => disconnect()}
            className={"flex flex-col py-1 px-6 text-base rounded-3xl bg-[#628EE4] border-4 border-[#F9EB68] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
          >
            <span>Disconnect</span><span className="text-xs text-white">{address!.slice(0, 12)}...</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;