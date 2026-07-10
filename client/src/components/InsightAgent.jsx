import { useContext, useEffect, useRef, useState } from "react"
import dashContext from "../context/dashContext"
import ReactMarkDown from 'react-markdown'
import remarkGfm from "remark-gfm"

const InsightAgent = () => {
    const [history, setHistory] = useState([
        { role: "assistant", content: "Hello! I am your Insight Agent. I can analyze your Reddit data or search the web. How can I help you today?" }
    ])

    const { sendAssistant } = useContext(dashContext);
    const [input, setInput] = useState("");
    const [loading, setloading] = useState(false);
    const [useWebSearch, setUseWebSearch] = useState(false); 

    const messagesEndRef = useRef(null)
    const scrollContainerRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [history.length, loading])

    const handleInput = (e) => setInput(e.target.value);

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return;

        const message = { role: 'user', content: input };
        setHistory((prev) => [...prev, message]);
        setInput("");
        setloading(true);

        const data = await sendAssistant(input, useWebSearch); 
        setloading(false);

        if (!data) {
            setHistory((prev) => [...prev, { role: 'assistant', content: "⚠️ Sorry, I couldn't reach the server. Please check your connection." }]);
            return;
        }

        const assistantMessage = { role: 'assistant', content: data.assistant };
        setHistory((prev) => [...prev, assistantMessage]);
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Chat Header */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        🧠
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">Insight Agent</h2>
                        <p className="text-xs text-slate-500">AI Analytics Assistant</p>
                    </div>
                </div>
            </div>

            {/* Chat messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-6 scroll-smooth"
            >
                <div className="max-w-3xl mx-auto space-y-6">
                    {history.map((msg, index) => {
                        const isUser = msg.role === "user"
                        return (
                            <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mr-3 mt-1">
                                        🧠
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                                        ${isUser
                                            ? "bg-slate-800 text-white rounded-br-sm"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100"
                                        }`}
                                >
                                {msg.role === 'assistant' ? (
                                    <ReactMarkDown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkDown>
                                ):(
                                    msg.content
                                )}
                                </div>
                            </div>
                        )
                    })}
                    
                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex w-full justify-start items-center">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mr-3">
                                🧠
                            </div>
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-5 py-4 text-slate-500 flex gap-1">
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} aria-hidden="true" className="h-2" />
                </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    
                    {/* Toggle and Context Header */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {useWebSearch ? "Searching: The Internet" : "Searching: Your Reddit Data"}
                        </span>
                        
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={useWebSearch}
                                onChange={(e) => setUseWebSearch(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 group-hover:ring-2 group-hover:ring-indigo-100 transition-all"></div>
                            <span className="ml-2 text-xs font-semibold text-slate-600">
                                {useWebSearch ? "🌐 Web Search" : "🔒 Local Only"}
                            </span>
                        </label>
                    </div>

                    {/* Chat Input Box */}
                    <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
                        <textarea
                            onChange={handleInput}
                            onKeyDown={handleKey}
                            value={input}
                            rows={1}
                            className="flex-1 max-h-[150px] min-h-[50px] w-full resize-none bg-transparent py-3.5 pl-4 pr-12 text-[15px] text-slate-700 placeholder-slate-400 focus:outline-none"
                            placeholder="Ask about your analytics..."
                            onInput={(e) => {
                                e.target.style.height = "auto"
                                e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px"
                            }}
                        />
                        <button
                            type="button"
                            disabled={loading || !input.trim()}
                            className={`absolute right-2 bottom-2 p-2 rounded-xl flex items-center justify-center transition-all
                                ${input.trim() && !loading 
                                    ? "bg-slate-800 text-white hover:bg-slate-700 shadow-md hover:-translate-y-0.5" 
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            onClick={handleSend}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InsightAgent