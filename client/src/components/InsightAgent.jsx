import { useContext, useEffect, useRef, useState } from "react"
import dashContext from "../context/dashContext"
import ReactMarkDown from 'react-markdown'
import remarkGfm from "remark-gfm"


const InsightAgent = () => {
    const [history, setHistory] = useState([
        { role: "assistant", content: "Hello. I am your Insight Agent. How can I help you today?" }
    ])

    const { sendAssistant } = useContext(dashContext);
    const [input, setInput] = useState("")
    const [loading, setloading] = useState(false)

    const messagesEndRef = useRef(null)
    const scrollContainerRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [history.length])

    const handleInput = (e) => {
        const value = e.target.value;
        setInput(value);
    }

    const handleKey=(e)=>{
        if(e.key==='Enter' && !e.shiftKey)
        {
            e.preventDefault();
            handleSend();
        }
    }

    const handleSend = async () => {
        if (!input.trim()) {
            return;
        }
        const message = {
            role: 'user',
            content: input
        }

        setHistory((prev) => [...prev, message]);
        setInput("");
        setloading(true);

        const data = await sendAssistant(input)
        setloading(false)

        if (!data) return;

        const assistantMessage = {
            role: 'assistant',
            content: data.assistant
        }

        setHistory((prev) => [...prev, assistantMessage])

    }

    return (
        <div className="flex flex-col h-full bg-[#fafafa]">
            {/* Chat messages – scrollable */}
            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-5 scroll-smooth"
                style={{ scrollBehavior: "smooth" }}
            >
                {history.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[#6b7280] text-sm sm:text-base">Ask anything</p>
                    </div>
                )}
                <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
                    {history.map((msg, index) => {
                        const isUser = msg.role === "user"
                        return (
                            <div
                                key={index}
                                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-[15px] leading-relaxed
                                        ${isUser
                                            ? "bg-[#0f172a] text-white"
                                            : "bg-white text-[#1f2937] border border-[#e5e7eb] shadow-sm"
                                        }`}
                                >
                                {msg.role==='assistant' ? (
                                    <ReactMarkDown remarkPlugins={remarkGfm}>
                                        {msg.content}
                                    </ReactMarkDown>
                                ):(
                                    msg.content
                                )}
                                </div>
                            </div>
                        )
                    })}
                    {loading && (
                        <div className="flex w-full justify-start">
                            <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-2xl px-4 py-2.5 text-[#1f2937]">
                                <span className="typing-dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} aria-hidden="true" />
                </div>
            </div>

            {/* Fixed bottom input bar */}
            <div className="shrink-0 border-t border-[#e5e7eb] bg-white px-3 sm:px-4 py-3 sm:py-4">
                <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 items-end">
                    <textarea
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        value={input}
                        rows={1}
                        className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 text-[15px] text-[#1f2937] placeholder-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 focus:border-[#0f172a]/40 transition-shadow max-h-[140px] sm:max-h-[160px]"
                        placeholder="Message Insight Agent…"
                        onInput={(e) => {
                            e.target.style.height = "auto"
                            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
                        }}
                        aria-label="Message input"
                    />
                    <button
                        type="button"
                        disabled={loading}
                        className={`shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0f172a] text-white hover:bg-[#1e293b] active:scale-[0.98] transition-colors transition-transform cursor-pointer
                           ${loading? "bg-gray-400 cursor-now-allowed":""} `}
                        aria-label="Send"
                        onClick={handleSend}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 sm:w-5 sm:h-5"
                        >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InsightAgent
