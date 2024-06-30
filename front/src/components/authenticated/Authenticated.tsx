import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers, TransactionReceipt } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { FONT_BOLD } from "@/fonts/fonts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Gallery, Nft } from "@/components/Gallery";
import { agentABI, dalleABI } from "@/types/network";
import Navbar from "../navbar";
import { Field, Label, Select } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const HTML_REGULAR =
  /<(?!img|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|td|\/td|th|\/th|br|\/br).*?>/gi

export const Authenticated = () => {
  const { walletProvider } = useWeb3ModalProvider()
  const { address, chainId } = useWeb3ModalAccount()

  const textAreaRef = useRef<HTMLElement>(null)
  const [message, setMessage] = useState<string>("")
  const [metaphor, setMetaphor] = useState<string>("")
  const [day, setDay] = useState<string>("today")
  const [date, setDate] = useState<string>("")
  const [agentResponse, setAgentResponse] = useState<AgentResponse>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isMintingLoading, setIsMintingLoading] = useState(false)

  const [_, setUserNftsCount] = useState<number>(0)
  const userNfts = useRef<Nft[]>([])

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

  const onDayChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value
    const dateSelected = new Date()
    
    if (value == "yesterday") {
      const day = dateSelected.getDate() - 1;
      dateSelected.setDate(day);
      setDate(dateSelected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }))
    } else if (value == "twodays") {
      const day = dateSelected.getDate() - 2;
      dateSelected.setDate(day);
      setDate(dateSelected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }))
    } else{
      setDate(dateSelected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }))
    }
    setDay(value)
  };

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
    const dalleContract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", dalleABI, signer)
    let indexedUserNfts: Nft[] = []
    for (let i = 0; i < 5; i++) {
      if ((userNfts.current || []).length > 5) break
      try {
        const token = await dalleContract.tokenOfOwnerByIndex(address, i)
        if (token !== undefined) {
          const tokenUri = await dalleContract.tokenURI(token)
          if (tokenUri) indexedUserNfts = [{ tokenUri }, ...indexedUserNfts]
        }
      } catch (e) {
        break
      }
    }
    userNfts.current = [...userNfts.current, ...indexedUserNfts]
    setUserNftsCount(userNfts.current.length)
    setIsUserNftsLoading(false)
  }

  const getOtherNfts = async () => {
    if (!walletProvider || !address) return
    setIsOtherNftsLoading(true)
    const ethersProvider = new BrowserProvider(walletProvider)
    const signer = await ethersProvider.getSigner()
    const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", dalleABI, signer)
    let indexedNfts: Nft[] = []
    try {
      const totalSupply = await contract.totalSupply()
      if (!totalSupply) return
      for (let i = Number(totalSupply) - 1; i >= 0; i--) {
        if (indexedNfts.length > 5 || otherNfts.length > 5) break
        try {
          const tokenUri = await contract.tokenURI(i)
          if (tokenUri) indexedNfts = [...indexedNfts, { tokenUri }]
        } catch (e) {
          break
        }
      }
      setOtherNfts(indexedNfts)
    } catch (e) {

    }

    setIsOtherNftsLoading(false)
  }

  const onExplain = useCallback(
    async (e: any) => {
      //const input = (textAreaRef.current?.innerHTML?.replace(HTML_REGULAR, '') || '').replace(/(<br\s*\/?>\s*)+$/, '')
      const input = `Stocks markets news for ${date}`
      if (!walletProvider || !input) return

      setIsLoading(true)
      try {
        // The query you want to start the agent with
        const query = input
        const maxIterations = 10
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const agentContract = new Contract(process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS || "", agentABI, signer)

        // Call the startChat function
        const transactionResponse = await agentContract.runAgent(query, maxIterations);
        const receipt = await transactionResponse.wait()
        setMessage("")
        setAgentResponse(undefined)
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
              console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
              messages.push(message)
            }
          }*/

          await new Promise(resolve => setTimeout(resolve, 2000))
          if (exitNextLoop) {
            console.log(`agent run ID ${agentRunID} finished!`);
            break;
          }
          if (await agentContract.isRunFinished(agentRunID)) {
            exitNextLoop = true;
          }
        }
        console.log("onExplain messages:", messages)
      } catch (error: any) {
        console.log("onExplain error:", error);
      }
      setIsLoading(false)
      setIsMintingLoading(false)
    },
    [walletProvider, isLoading]
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
        console.log("Could not parse log:", log)
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
      //const input = (textAreaRef.current?.innerHTML?.replace(HTML_REGULAR, '') || '').replace(/(<br\s*\/?>\s*)+$/, '')
      const input = agentResponse?.metaphor.text
      if (!walletProvider || !input) return

      setIsLoading(true)
      try {
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", dalleABI, signer)
        const tx = await contract.initializeMint(input)
        const receipt = await tx.wait()
        setMessage("")
        const tokenId = getNftId(receipt, contract)
        if (tokenId !== undefined) {
          setIsMintingLoading(true)
          const tokenUri = await pollTokenUri(contract, tokenId)
          if (tokenUri) {
            userNfts.current = [
              { tokenUri, txHash: receipt.hash },
              ...userNfts.current,
            ]
            setUserNftsCount(userNfts.current.length)

          }
        }

      } catch {
      }
      setIsLoading(false)
      setIsMintingLoading(false)
    },
    [walletProvider, isLoading]
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
    <div className="flex flex-row mx-auto justify-center gap-2">
      <span className="mt-1 text-2xl"> What {day == "today" ? "is" : "was"} happening with the stocks markets</span>

      <Field>
        <div className="relative">
          <Select onChange={onDayChange}
            className="block w-60 appearance-none rounded-lg border-none bg-white py-1.5 px-3 text-2xl text-black focus:outline-none  *:text-black">
            {days.map((day) => (
              <option value={day.value} >
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
      className={"flex flex-row items-center gap-2 px-5 py-2 rounded-lg bg-[#F0D061] mx-auto text-xl text-black hover:text-white hover:bg-[#374F81] duration-200 " + FONT_BOLD.className}
    >
      {isLoading && <AiOutlineLoading3Quarters className="animate-spin size-4" />}
      Get Explanation
    </button>
    <button
      onClick={onMint}
      className={"flex flex-row items-center gap-2 px-5 py-2 rounded-lg bg-[#F0D061] mx-auto text-xl text-black hover:text-white hover:bg-[#374F81] duration-200 " + FONT_BOLD.className}
    >
      {isLoading && <AiOutlineLoading3Quarters className="animate-spin size-4" />}
      Generate NFT
    </button>



    <div>
      <div className="text-xl">Messages</div>
      {date}
      {agentResponse && (
        <div className="flex flex-col items-center m-2">
          <div
            className="w-full bg-white p-3 rounded border text-black"
          >Metaphor: {agentResponse.metaphor.text}
          </div>
          <div
            className="w-full bg-white p-3 rounded border text-black"
          >Explanation: {agentResponse.explanation.text}
          </div>
        </div>
      )}
    </div>

    <div>
      <div className="text-xl font-bold">Messages</div>
      {messages.map((msg, index) => (
        <div key={index} className="flex flex-col items-center m-2">
          <div
            className="w-full bg-white p-3 rounded border text-black"
          >{msg.role === 'assistant' ? 'THOUGHT' : 'STEP'}:{msg.content}
          </div>
        </div>
      ))}
    </div>

    <div>
      <div className="text-xl">My NFTs</div>
      <Gallery
        isMintingLoading={isMintingLoading}
        isLoading={isUserNftsLoading}
        nfts={userNfts.current}
        type={"user"}
      />
    </div>

    <div>
      <div className="text-xl"> Others&apos; NFTs</div>

      <Gallery
        isMintingLoading={false}
        isLoading={isOtherNftsLoading}
        nfts={otherNfts}
        type={"other"}
      />
    </div>

  </div>
}