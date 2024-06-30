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
        <div className="h-screen flex flex-col gap-8 justify-center ">
          <img
            className="h-auto w-full md:w-1/2 mx-auto"
            src="/logoHor.png"
            alt="ClarityMarket, invest with confidence, learn with clarity"
          />
          <p className="text-center text-lg lg:text-xl">
            Your guide to seeing through the noise of the market.
          </p>
          <button
            onClick={() => open()}
            className={"flex flex-row items-center gap-2 px-5 py-2 mx-auto text-xl rounded-3xl border-4 border-[#F9EB68] bg-[#628EE4] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
          >
            Connect wallet to Enter
          </button>
          <p className="text-center font-bold text-base lg:text-lg">
            Understanding the stocks markets and making investing decisions have never been easier!
          </p>
        </div>
        :
        <Authenticated />
      }
    </main>
  )
}
