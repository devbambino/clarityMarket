"use client"

import { FONT_BOLD, FONT } from "@/fonts/fonts";
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { Authenticated } from "@/components/authenticated/Authenticated";


export function Landing() {
  const { open } = useWeb3Modal()

  const { address } = useWeb3ModalAccount()


  return (
    <main className={"h-screen flex flex-col " + FONT.className}>
      {!address ?
        <div className="h-screen flex flex-col gap-8 justify-center text-center items-center">
          <img
            className="h-auto w-full md:w-1/2 mx-auto"
            src="/logoHor.png"
            alt="ClarityMarket, invest with confidence, learn with clarity"
          />
          <p className="w-full text-center py-2 font-bold text-2xl bg-white text-[#3c4e7d]"> Are you <span className={"uppercase underline px-2 text-4xl text-[#3c4e7d] " + FONT_BOLD.className}>tired</span> of losing money on the stocks markets <span className={"underline px-2 text-4xl text-[#3c4e7d] " + FONT_BOLD.className}> ??? </span></p>
          <p className="leading-relaxed w-2/3 text-center text-2xl">
            All you need is <span className={"underline text-4xl text-[#F9EB68] " + FONT_BOLD.className}>Clarity</span>, our AI-powered financial educational platform designed to <span className={"px-2 text-[#3c4e7d] bg-white " + FONT_BOLD.className}>Empower retail investors</span>, like you!!!
          </p>
          <p className="text-center text-lg lg:text-2xl">
            Let <span className={"underline text-4xl text-[#F9EB68] " + FONT_BOLD.className}>Clarity</span> be your guide to seeing through the noise of the market:
          </p>
          <button
            onClick={() => open()}
            className={"flex flex-row items-center gap-2 px-5 py-2 mx-auto text-xl rounded-3xl border-4 border-[#F9EB68] bg-[#628EE4] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
          >
            Connect wallet to Enter
          </button>
          <p className="text-center font-bold text-base lg:text-lg">
            Making better investing decisions on the stocks market have never been easier!
          </p>
          
        </div>
        :
        <Authenticated />
      }
    </main>
  )
}
