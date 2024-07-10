import ProgressBar from "@/components/ProgressBar";
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { FONT_BOLD } from "@/fonts/fonts";
import { useState } from 'react'
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"


interface Props {
    isMintingLoading: boolean
    isLoading: boolean
    // Need tokenIds and stuff?
    nfts: Nft[]
    //moments: ClarityMoment[]
    type: "user" | "other"
}

export interface Nft {
    tokenUri: string
    prompt: string
    txHash?: string
}

export interface ClarityMoment {
    owner: string,
    prompt: string,
    isMinted: Boolean,
}

export const CarouselGallery = ({ isMintingLoading, isLoading, nfts, type }: Props) => {

    const [isMomentOpen, setIsMomentOpen] = useState(false)
    const [selectedMoment, setSelectedMoment] = useState("")

    const openMoment = (prompt: string) => {
        setSelectedMoment(prompt)
        setIsMomentOpen(true)
    }

    const closeMoment = () => {
        setIsMomentOpen(false)
    }

    return <div className="">
        {isLoading ?
            <div>Loading...</div>
            :
            <div className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    {isMintingLoading ?
                        <div
                            className="md:basis-1/5 square relative items-center align-middle"
                        >
                            <MintLoading />
                        </div>
                        :
                        <Carousel
                            showArrows={true}
                            showIndicators={true}
                            infiniteLoop={true}
                            dynamicHeight={false}
                            className="max-w-sm text-[#F9EB68]"
                        >

                            {(nfts || []).slice(0, isMintingLoading ? 4 : 5).map((nft, i) =>

                                <div key={`nft_${type}_${i}`} className="rounded-xl bg-[#374F81] p-8">
                                    <div className="">
                                        <img
                                            src={nft.tokenUri}
                                            alt={`nft_${type}_${i}`}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        {nft.prompt && <div>
                                            <p
                                                className="underline text-center cursor-pointer"
                                                onClick={(prompt) => openMoment(nft.prompt)}
                                            >
                                                Imagine... {nft.prompt.slice(25, 80)}...
                                            </p>
                                        </div>}
                                    </div>
                                    <div className="hidden">
                                        {nft.txHash && <div>
                                            <a
                                                className="underline"
                                                href={`https://explorer.galadriel.com/tx/${nft.txHash}`}
                                                target="_blank"
                                            >
                                                {nft.txHash.slice(0, 12)}...
                                            </a>
                                        </div>}
                                    </div>
                                </div>


                            )}
                        </Carousel>
                    }

                </div>

                <div className="hidden md:flex flex-col md:flex-row gap-10 items-center ">
                    {(nfts || []).slice(0, isMintingLoading ? 4 : 5).map((nft, i) => <div
                        key={`nft_${type}_${i}`}
                        className="basis-1/5"
                    >
                        {nft.txHash && <div>
                            <a
                                className="underline"
                                href={`https://explorer.galadriel.com/tx/${nft.txHash}`}
                                target="_blank"
                            >
                                <div className="hidden lg:block">
                                    {nft.txHash.slice(0, 12)}...
                                </div>
                                <div className="block lg:hidden">
                                    {nft.txHash.slice(0, 8)}...
                                </div>
                            </a>
                        </div>}
                    </div>)}
                </div>
                {(!(nfts || []).length && !isMintingLoading) && <div>
                    {type === "other" ?
                        <div>Make sure your wallet RPC URL is https://devnet.galadriel.com/</div>
                        :
                        <div>No Clarity NFTs yet</div>
                    }
                </div>}
                <Dialog open={isMomentOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <DialogPanel
                                transition
                                className="w-full max-w-md rounded-xl bg-[#374F81] p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                            >
                                <DialogTitle as="h3" className={"text-left text-base/7 font-bold text-[#F9EB68] group-data-[hover]:text-white/80 " + FONT_BOLD.className}>
                                    The Clarity Moment
                                </DialogTitle>
                                <p className="mt-2 text-sm/6 text-white">
                                    {selectedMoment}
                                </p>
                                <div className="mt-4">
                                    <Button
                                        className="inline-flex items-center gap-2 py-1.5 px-3 text-sm/6 font-semibold rounded-3xl border-4 border-[#F9EB68] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
                                        onClick={closeMoment}
                                    >
                                        Clear, Thanks!
                                    </Button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </div>


        }
    </div>
}

const MintLoading = () => {
    return <div className="square-content bg-[#B6B6B6] flex flex-col justify-end text-sm text-black">
        <div className="p-2">
            Generating & minting your Clarity NFT...
        </div>
        <ProgressBar duration={10} />
    </div>
}