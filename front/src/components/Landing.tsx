"use client"

import { FONT_BOLD, FONT } from "@/fonts/fonts";
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { Authenticated } from "@/components/authenticated/Authenticated";
import { FaChartLine, FaRobot, FaLightbulb, FaSearch } from 'react-icons/fa';

export function Landing() {
  const { open } = useWeb3Modal()

  const { address } = useWeb3ModalAccount()

  return (
    <>
      {!address ?
        <>
          <nav className="flex flex-row w-full align-middle bg-[#3c4e7d] p-8">
            <div className="flex-auto flex items-center space-x-2 text-white">
              <FaChartLine className="text-2xl text-[#F9EB68]" />
              <span className="text-2xl font-bold">Clarity<span className={"text-[#F9EB68] " + FONT_BOLD.className}>Market</span></span>
            </div>
          </nav>
          <div className="container flex flex-col items-center md:flex-row md:space-x-6 mx-auto p-4 md:p-20">
            <div className="max-w-2xl text-lg text-center md:text-left px-20">
              <span className="md:text-4xl font-bold mb-4 bg-white text-[#3c4e7d]">Are you tired of losing money on the stocks markets <b>???</b></span>
              <p className="leading-snug md:text-3xl my-8">
                All you need is <span className={"underline md:text-4xl text-[#F9EB68] " + FONT_BOLD.className}>Clarity</span>, our AI-powered financial educational app designed to <span className={"px-2 text-[#3c4e7d] bg-white " + FONT_BOLD.className}>Empower retail investors</span>
              </p>
              <div className="flex justify-center mt-6 space-x-4 md:justify-start">
                <button
                  onClick={() => open()}
                  className={"flex flex-row items-center gap-2 px-5 py-2 mx-auto text-sm md:text-xl rounded-3xl border-4 border-[#F9EB68] bg-[#47a1ff] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
                >
                  Connect wallet to Enter
                </button>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <img src="/investor.png" alt="Empowered Investor" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </>
        :
        <Authenticated />
      }
    </>


  )

  return (
    <div className="min-h-screen bg-[#47a1ff] text-white flex flex-col items-center justify-center">
      <header className="flex items-center justify-between w-full px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-4xl font-bold">Clarity<span className={"text-[#F9EB68] " + FONT_BOLD.className}>Market</span></span>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center space-y-8 md:flex-row md:space-y-0 md:space-x-8">
        <div className="text-center md:text-left">
          <p className="w-full text-center py-2 font-bold text-2xl bg-white text-[#3c4e7d]"> Are you <span className={"uppercase underline px-2 text-4xl text-[#3c4e7d] " + FONT_BOLD.className}>tired</span> of losing money on the stocks markets <span className={"underline px-2 text-4xl text-[#3c4e7d] " + FONT_BOLD.className}> ??? </span></p>
          <p className="leading-relaxed w-2/3 text-2xl">
            All you need is <span className={"underline text-4xl text-[#F9EB68] " + FONT_BOLD.className}>Clarity</span>, our AI-powered financial educational platform designed to <span className={"px-2 text-[#3c4e7d] bg-white " + FONT_BOLD.className}>Empower retail investors</span>, like you!!!
          </p>
          <div className="flex justify-center mt-6 space-x-4 md:justify-start">
            <button
              onClick={() => open()}
              className={"flex flex-row items-center gap-2 px-5 py-2 mx-auto text-xl rounded-3xl border-4 border-[#F9EB68] bg-[#47a1ff] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] duration-200 " + FONT_BOLD.className}
            >
              Connect wallet to Enter
            </button>
          </div>
        </div>
        <div className="flex w-full max-w-2xl">
          <p className="text-center text-lg lg:text-2xl">
            Let <span className={"underline text-4xl text-[#F9EB68] " + FONT_BOLD.className}>Clarity</span> be your guide to seeing through the noise of the market:
          </p>
          <p className="text-center font-bold text-base lg:text-lg">
            Making better investing decisions on the stocks market have never been easier!
          </p>
        </div>
      </main>
    </div>
  )


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
