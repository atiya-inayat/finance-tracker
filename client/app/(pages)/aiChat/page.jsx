// // "use client";
// // import { useState } from "react";
// // import { API_BASE_URL } from "@/app/lib/constant";

// // export default function FloatingAIChat() {
// //   const [input, setInput] = useState("");
// //   const [response, setResponse] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [isOpen, setIsOpen] = useState(false); // toggle chat panel

// //   const sendPrompt = async () => {
// //     if (!input.trim()) return;
// //     setLoading(true);

// //     try {
// //       const res = await fetch(`${API_BASE_URL}/ai/ask`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ prompt: input }),
// //       });

// //       const data = await res.json();
// //       setResponse(data.response);
// //     } catch (err) {
// //       setResponse("Something went wrong. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Floating Button */}
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
// //       >
// //         💬
// //       </button>

// //       {/* Chat Panel */}
// //       {isOpen && (
// //         <div className="fixed bottom-20 right-6 w-80 max-w-full bg-white rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
// //           {/* Header */}
// //           <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
// //             <span>AI Assistant</span>
// //             <button
// //               onClick={() => setIsOpen(false)}
// //               className="text-white font-bold"
// //             >
// //               ✕
// //             </button>
// //           </div>

// //           {/* Messages */}
// //           <div className="p-4 flex-1 overflow-y-auto h-60 bg-gray-50">
// //             {response ? (
// //               <div className="bg-gray-100 p-3 rounded-xl text-gray-700 whitespace-pre-wrap">
// //                 {response}
// //               </div>
// //             ) : (
// //               <p className="text-gray-400 text-sm">
// //                 Ask me anything about your finances...
// //               </p>
// //             )}
// //           </div>

// //           {/* Input */}
// //           <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
// //             <input
// //               type="text"
// //               placeholder="Type your question..."
// //               value={input}
// //               onChange={(e) => setInput(e.target.value)}
// //               className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //             <button
// //               onClick={sendPrompt}
// //               disabled={loading}
// //               className={`px-4 py-2 rounded-xl text-white font-medium transition ${
// //                 loading
// //                   ? "bg-gray-400 cursor-not-allowed"
// //                   : "bg-blue-600 hover:bg-blue-700"
// //               }`}
// //             >
// //               {loading ? "..." : "Send"}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// "use client";
// import { useState, useRef, useEffect } from "react";
// import { API_BASE_URL } from "@/app/lib/constant";

// export default function FloatingAIChat() {
//   const [input, setInput] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // toggle chat panel

//   const messagesEndRef = useRef(null);

//   // Auto-scroll to the latest message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [response]);

//   const sendPrompt = async () => {
//     if (!input.trim()) return;
//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/ai/ask`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt: input }),
//       });

//       const data = await res.json();
//       setResponse(data.response);
//       setInput(""); // clear input after sending
//     } catch (err) {
//       setResponse("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
//       >
//         💬
//       </button>

//       {/* Chat Panel */}
//       {isOpen && (
//         <div className="fixed bottom-20 right-6 w-80 max-w-full bg-white rounded-xl shadow-xl z-50 flex flex-col overflow-hidden h-[400px]">
//           {/* Header */}
//           <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
//             <span>AI Assistant</span>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-white font-bold"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//             {response ? (
//               <div className="bg-gray-100 p-3 rounded-xl text-gray-700 whitespace-pre-wrap">
//                 {response}
//               </div>
//             ) : (
//               <p className="text-gray-400 text-sm">
//                 Ask me anything about your finances...
//               </p>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
//             <input
//               type="text"
//               placeholder="Type your question..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") sendPrompt();
//               }}
//             />
//             <button
//               onClick={sendPrompt}
//               disabled={loading}
//               className={`px-4 py-2 rounded-xl text-white font-medium transition ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {loading ? "..." : "Send"}
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/app/lib/constant";

export default function FloatingAIChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [canSend, setCanSend] = useState(true);
  const messagesEndRef = useRef(null);

  const MAX_MESSAGES = 10; // max messages per hour

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  // Check message count per hour
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("aiChatMessages")) || {
      count: 0,
      firstMessageTime: null,
    };
    const now = new Date().getTime();

    if (data.firstMessageTime && now - data.firstMessageTime > 60 * 60 * 1000) {
      // Reset after 1 hour
      localStorage.setItem(
        "aiChatMessages",
        JSON.stringify({ count: 0, firstMessageTime: null })
      );
      setCanSend(true);
    } else if (data.count >= MAX_MESSAGES) {
      setCanSend(false);
    } else {
      setCanSend(true);
    }
  }, [response]);

  const sendPrompt = async () => {
    if (!input.trim()) return;
    if (!canSend) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      setResponse(data.response);
      setInput("");

      // Update localStorage message count
      const storageData = JSON.parse(
        localStorage.getItem("aiChatMessages")
      ) || {
        count: 0,
        firstMessageTime: null,
      };

      const now = new Date().getTime();
      if (!storageData.firstMessageTime) storageData.firstMessageTime = now;

      storageData.count += 1;

      localStorage.setItem("aiChatMessages", JSON.stringify(storageData));

      // Disable sending if max reached
      if (storageData.count >= MAX_MESSAGES) setCanSend(false);
    } catch (err) {
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        💬
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 max-w-full bg-white rounded-xl shadow-xl z-50 flex flex-col overflow-hidden h-[400px]">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
            <span>AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {response ? (
              <div className="bg-gray-100 p-3 rounded-xl text-gray-700 whitespace-pre-wrap">
                {response}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Ask me anything about your finances...
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
            <input
              type="text"
              placeholder={
                canSend
                  ? "Type your question..."
                  : "Message limit reached (10/hour)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 ${
                canSend
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-gray-300 bg-gray-100 cursor-not-allowed"
              }`}
              disabled={!canSend}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendPrompt();
              }}
            />
            <button
              onClick={sendPrompt}
              disabled={loading || !canSend}
              className={`px-4 py-2 rounded-xl text-white font-medium transition ${
                !canSend || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
