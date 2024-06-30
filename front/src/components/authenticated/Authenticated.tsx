import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers, TransactionReceipt } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { FONT_BOLD } from "@/fonts/fonts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { ClarityMoment, Gallery, Nft } from "@/components/Gallery";
import { agentABI, dalleABI } from "@/types/network";
import Navbar from "../navbar";
import { Field, Select, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const HTML_REGULAR =
  /<(?!img|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|td|\/td|th|\/th|br|\/br).*?>/gi

export const Authenticated = () => {
  const { walletProvider } = useWeb3ModalProvider()
  const { address, chainId } = useWeb3ModalAccount()

  const textAreaRef = useRef<HTMLElement>(null)

  const [day, setDay] = useState<string>("today")
  const [date, setDate] = useState<Date>(new Date())
  const dateRef = useRef<Date>()
  const agentResponseRef = useRef<AgentResponse>()

  const [dateFormatted, setDateFormatted] = useState<string>("")
  const [agentResponse, setAgentResponse] = useState<AgentResponse>()
  const [isLoadingExplain, setIsLoadingExplain] = useState<boolean>(false)
  const [isLoadingMint, setIsLoadingMint] = useState<boolean>(false)

  const [isMintingLoading, setIsMintingLoading] = useState(false)

  const [_, setUserNftsCount] = useState<number>(0)
  const [userNfts, setUserNfts] = useState<Nft[]>([])
  const [otherNfts, setOtherNfts] = useState<Nft[]>([])

  const [isUserNftsLoading, setIsUserNftsLoading] = useState<boolean>(false)
  const [isOtherNftsLoading, setIsOtherNftsLoading] = useState<boolean>(false)

  const [messages, setMessages] = useState<Message[]>([])

  interface Message {
    role: string,
    content: string,
  }

  interface AgentResponse {
    explanation: { text: string, links: string[] },
    metaphor: { text: string },
  }

  const handleDayChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLSelectElement>) => {

    let dateSelected = new Date()
    if (value == "yesterday") {
      const day = dateSelected.getDate() - 1
      dateSelected.setDate(day)
    } else if (value == "twodays") {
      const day = dateSelected.getDate() - 2
      dateSelected.setDate(day)
    }

    dateRef.current = dateSelected
    setDay(value)
    setDate(dateSelected)
  }

  const days = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'twodays', label: 'Two days ago' },
  ]

  useEffect(() => {
    getUserNfts()
    getOtherNfts()
  }, [chainId])

  const getUserNfts = async () => {
    if (!walletProvider || !address) return
    setIsUserNftsLoading(true)
    const ethersProvider = new BrowserProvider(walletProvider)
    const signer = await ethersProvider.getSigner()
    const dalleContract = new Contract(process.env.NEXT_PUBLIC_DALLE_CONTRACT_ADDRESS || "", dalleABI, signer)
    let indexedUserNfts: Nft[] = []

    const ownerBalance = await dalleContract.balanceOf(address)
    for (let i = Number(ownerBalance) - 1; i >= 0; i--) {
      //for (let i = 0; i < 5; i++) {
      // if ((userNfts.current || []).length > 5) break
      if (userNfts.length > 5 || indexedUserNfts.length > 5) break
      try {
        const token = await dalleContract.tokenOfOwnerByIndex(address, i)

        if (token !== undefined) {
          const tokenUri = await dalleContract.tokenURI(token)
          const moment: ClarityMoment = await dalleContract.mintInputs(token)
          const prompt = moment.prompt
          if (tokenUri) indexedUserNfts = [...indexedUserNfts, {
            tokenUri,
            prompt
          }]
        }
      } catch (error) {
        console.log(`error: ${error}`)
      }
    }
    setUserNfts(indexedUserNfts)
    //userNfts.current = [...userNfts.current, ...indexedUserNfts]
    setUserNftsCount(userNfts.length)
    setIsUserNftsLoading(false)
  }

  const getOtherNfts = async () => {
    if (!walletProvider || !address) return
    setIsOtherNftsLoading(true)
    const ethersProvider = new BrowserProvider(walletProvider)
    const signer = await ethersProvider.getSigner()
    const dalleContract = new Contract(process.env.NEXT_PUBLIC_DALLE_CONTRACT_ADDRESS || "", dalleABI, signer)
    let indexedNfts: Nft[] = []
    try {
      const totalSupply = await dalleContract.totalSupply()
      if (!totalSupply) return
      for (let i = Number(totalSupply) - 1; i >= 0; i--) {
        if (indexedNfts.length > 5 || otherNfts.length > 5) break
        try {
          const tokenUri = await dalleContract.tokenURI(i + 1)
          const moment: ClarityMoment = await dalleContract.mintInputs(i)
          const prompt = moment.prompt
          if (tokenUri) indexedNfts = [...indexedNfts, {
            tokenUri,
            prompt
          }]
        } catch (e) {
          console.log(`error: ${e}`);
        }
      }
      setOtherNfts(indexedNfts)
    } catch (error) {
      console.log(`error: ${error}`)
    }
    setIsOtherNftsLoading(false)
  }

  const onExplain = useCallback(
    async (e: any) => {
      setIsLoadingExplain(true)

      let latestDate = dateRef.current;

      if(!latestDate) latestDate = new Date()

      let dateSelected = latestDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
      //console.log(`onExplain dateSelected: ${dateSelected}`)
      const input = `Stocks markets news for ${dateSelected}`
      if (!walletProvider) return

      try {
        // The query you want to start the agent with
        const query = input
        const maxIterations = 10
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const agentContract = new Contract(process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS || "", agentABI, signer)

        setAgentResponse(undefined)
        // Call the startChat function
        const transactionResponse = await agentContract.runAgent(query, maxIterations);
        const receipt = await transactionResponse.wait()
        console.log(`Task sent, tx hash: ${receipt.hash}`)
        console.log(`Agent started with task: "${query}"`)

        // Get the agent run ID from transaction receipt logs
        let agentRunID = getAgentRunId(receipt, agentContract);
        console.log(`Created agent run ID: ${agentRunID}`)
        if (!agentRunID && agentRunID !== 0) {
          return
        }

        // Run the chat loop: read messages and send messages
        var exitNextLoop = false;
        while (true) {
          const newMessages: Message[] = await getNewMessages(agentContract, agentRunID, messages.length);
          setMessages(newMessages)

          /*if (newMessages) {
            for (let message of newMessages) {
              let roleDisplay = message.role === 'assistant' ? 'THOUGHT' : 'STEP';
              let color = message.role === 'assistant' ? '\x1b[36m' : '\x1b[33m'; // Cyan for thought, yellow for step
              console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`)
              messages.push(message)
            }
          }*/

          await new Promise(resolve => setTimeout(resolve, 2000))
          if (exitNextLoop) {
            console.log(`agent run ID ${agentRunID} finished!`)
            break;
          }
          if (await agentContract.isRunFinished(agentRunID)) {
            exitNextLoop = true;
          }
        }
        console.log("onExplain messages:", messages)
      } catch (error: any) {
        console.log("onExplain error:", error)
      }
      setIsLoadingExplain(false)
    },
    [walletProvider, isLoadingExplain]
  )

  const getAgentRunId = (receipt: TransactionReceipt, contract: Contract): number | undefined => {
    let agentRunID
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog && parsedLog.name === "AgentRunCreated") {
          // Second event argument
          agentRunID = ethers.toNumber(parsedLog.args[1])
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.log("error:", error)
      }
    }
    return agentRunID;
  }

  const getNewMessages = async (contract: Contract, agentRunID: number, currentMessagesCount: number): Promise<Message[]> => {
    const messages = await contract.getMessageHistoryContents(agentRunID)
    const roles = await contract.getMessageHistoryRoles(agentRunID)

    const newMessages: Message[] = []
    messages.forEach((message: any, i: number) => {
      if (i >= currentMessagesCount) {
        if (roles[i] == "assistant") {
          const cleanedJsonString = messages[i].replace(/^```json\s*|```\s*$/g, "");
          const responseJson = JSON.parse(cleanedJsonString);
          const responseObject: AgentResponse = {
            explanation: { text: responseJson.explanation.text, links: responseJson.explanation.links },
            metaphor: { text: responseJson.metaphor.text },
          }
          setAgentResponse(responseObject)
          agentResponseRef.current = responseObject
        }
        console.log(`${roles[i]}:${messages[i]}`);
        newMessages.push({
          role: roles[i],
          content: messages[i]
        })
      }
    })
    return newMessages;
  }

  const onMint = useCallback(
    async (e: any) => {
      let input = agentResponseRef.current;
      //console.log(`onMint input:${input}`);
      if (!walletProvider || !input) return

      setIsLoadingMint(true)
      try {
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const contract = new Contract(process.env.NEXT_PUBLIC_DALLE_CONTRACT_ADDRESS || "", dalleABI, signer)
        const tx = await contract.initializeMint(input.metaphor.text)
        const receipt = await tx.wait()
        const tokenId = getNftId(receipt, contract)
        if (tokenId !== undefined) {
          setIsMintingLoading(true)
          const tokenUri = await pollTokenUri(contract, tokenId)
          if (tokenUri) {
            getUserNfts()

          }
        }

      } catch (error: any) {
        console.log("onMint error:", error);
      }
      setIsLoadingMint(false)
      setIsMintingLoading(false)
    },
    [walletProvider, isLoadingMint]
  )

  const getNftId = (receipt: TransactionReceipt, contract: Contract): number | undefined => {
    let nftId
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog && parsedLog.name === "MintInputCreated") {
          // Second event argument
          nftId = ethers.toNumber(parsedLog.args[1])
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.log("Could not parse log:", log)
      }
    }
    return nftId;
  }

  const pollTokenUri = async (contract: Contract, tokenId: number): Promise<string | undefined> => {
    // max amount of time to wait
    for (let i = 0; i < 120; i++) {
      try {
        const uri = await contract.tokenURI(tokenId)
        if (uri) return uri
      } catch (e) {
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const handleKeypress = useCallback(
    (e: any) => {
      if (e.keyCode == 13 && !e.shiftKey) {
        onMint(e)
        e.preventDefault()
      }
    },
    [onMint]
  )

  return <div className="w-full px-2 md:px-20 flex flex-col gap-16">
    <Navbar></Navbar>
    <div className="flex flex-col md:flex-row mx-auto items-center text-center gap-2">
      <span className="text-2xl"> Wondering what <span className={"underline text-4xl text-[#F9EB68] " + FONT_BOLD.className}>{day == "today" ? "is" : "was"}</span> happening with the stocks markets</span>

      <Field>
        <div className="relative">
          <Select name="date" onChange={handleDayChange}
            className="block w-60 appearance-none rounded-lg border-none bg-white py-1.5 px-3 text-2xl text-black focus:outline-none  *:text-black">
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </Select>
        </div>
      </Field>
      <p className={"text-center text-4xl " + FONT_BOLD.className}>
        ???
      </p>
    </div>
    <button
      onClick={onExplain}
      disabled={isLoadingExplain || isLoadingMint}
      className={"flex flex-row items-center gap-2 px-5 py-2 rounded-3xl border-4 border-[#F9EB68] bg-[#628EE4] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] mx-auto text-xl  duration-200 " + FONT_BOLD.className}
    >
      {isLoadingExplain && <AiOutlineLoading3Quarters className="animate-spin size-4" />}
      Get A Clarity Moment
    </button>

    {agentResponse && (
      <div>
        <div className="mx-auto w-full max-w-lg divide-y divide-white/5 rounded-xl bg-[#374F81]">
          <Disclosure as="div" className="p-6" defaultOpen={true}>
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className={"text-lg font-bold text-[#F9EB68] group-data-[hover]:text-white/80 " + FONT_BOLD.className}>
                This is what {day == "today" ? "is" : "was"} happening with the stocks markets...
              </span>
              <ChevronDownIcon className="size-5 fill-[#F9EB68] group-data-[hover]:fill-white/50 group-data-[open]:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-base text-white">
              {agentResponse.metaphor.text}
              <button
                onClick={onMint}
                disabled={isLoadingExplain || isLoadingMint}
                className={"flex flex-row items-center gap-2 mt-4 px-5 py-2 rounded-3xl border-4 border-[#F9EB68] text-[#F9EB68] hover:text-black hover:bg-[#F9EB68] mx-auto text-base  duration-200 " + FONT_BOLD.className}
              >
                {isLoadingMint && <AiOutlineLoading3Quarters className="animate-spin size-4" />}
                Mint Your Clarity Moment
              </button>
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className={"text-left text-base font-bold text-[#F9EB68] group-data-[hover]:text-white/80 " + FONT_BOLD.className}>
                <b>Fancy a more technical explanation?</b>
              </span>
              <ChevronDownIcon className="size-5 fill-[#F9EB68] group-data-[hover]:fill-white/50 group-data-[open]:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-base text-white">{agentResponse.explanation.text}</DisclosurePanel>
          </Disclosure>
        </div>
      </div>
    )}

    <div>
      <div className={"text-xl text-[#F9EB68] " + FONT_BOLD.className}>Your Most Recent Clarity Moments</div>
      <Gallery
        isMintingLoading={isMintingLoading}
        isLoading={isUserNftsLoading}
        nfts={userNfts}
        type={"user"}
      />
    </div>

    <div>
      <div className={"text-xl text-[#F9EB68] " + FONT_BOLD.className}> Most Recent Clarity Moments From The Community</div>
      <Gallery
        isMintingLoading={false}
        isLoading={isOtherNftsLoading}
        nfts={otherNfts}
        type={"other"}
      />
    </div>

  </div>
}
