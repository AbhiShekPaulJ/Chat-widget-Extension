import { useState } from "react";
import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";




function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ask");

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // const getPageContent = () => {
  //   console.log("📡 Getting page content...");

  //   return new Promise((resolve, reject) => {
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       console.log("Tabs:", tabs);

  //       if (!tabs || !tabs[0]) {
  //         return reject("No active tab");
  //       }

  //       chrome.scripting.executeScript(
  //         {
  //           target: { tabId: tabs[0].id },
  //           func: () => document.body.innerText,
  //         },
  //         (results) => {
  //           if (chrome.runtime.lastError) {
  //             console.error("Script error:", chrome.runtime.lastError);
  //             return reject(chrome.runtime.lastError);
  //           }

  //           console.log("Results:", results);

  //           if (!results || !results[0]) {
  //             return reject("No results");
  //           }

  //           resolve(results[0].result);
  //         }
  //       );
  //     });
  //   });
  // };
  const getPageContent = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            // func: () => {
            //   return window.getSelection().toString() || document.body.innerText;
            // }
            func: () => {
              const blocks = [];

              const root =
                document.querySelector("main") ||
                document.querySelector("[role=main]") ||
                document.body;

              let currentHeading = "";

              const elements = root.querySelectorAll("h1, h2, h3, p, li");

              elements.forEach(el => {
                const text = el.innerText.trim();

                if (!text || text.length < 40) return;

                if (el.tagName.startsWith("H")) {
                  currentHeading = text;
                }

                blocks.push({
                  text,
                  tag: el.tagName,
                  heading: currentHeading
                });
              });
              console.log("Extracted blocks:", blocks);
              // return window.getSelection().toString() || blocks;
              const selection = window.getSelection().toString();

              if (selection) return selection;

              // 🔥 sanitize blocks (VERY IMPORTANT)
              return blocks.map(b => ({
                text: String(b.text),
                tag: String(b.tag),
                heading: String(b.heading)
              }));
            }
          },
          (results) => {
            if (!results || !results[0]) return reject("No content");
            resolve(results[0].result);
          }
        );
      });
    });
  };
  const ask = async () => {
    // if (!query.trim()) return;
    if (mode === "ask" && !query.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      // const pageContent = await getPageContent();
      const pageContent = await getPageContent();
      // const limitedContent = pageContent;
      // limitedContent.slice(0, 3000);
      const limitedContent = Array.isArray(pageContent)
        ? pageContent.slice(0, 50) // limit blocks instead
        : pageContent.slice(0, 3000);

      console.log("SENDING CONTEXT:", pageContent);

      const res = await fetch("http://localhost:5678/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: mode === "ask" ? query : "",
          context: limitedContent,
          mode
        })
      });

      const data = await res.json();
      console.log(data.answer)
      setMessages(prev => [...prev, { role: "bot", text: data.answer }]);

    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "You messed up buddy! Fix it!" }]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };
  useEffect(() => {
    if (mode !== "ask") {
      ask(); // 🔥 auto trigger
    }
  }, [mode]);



  return (

    <div className="h-137.5 w-100 flex flex-col bg-blue-950 backdrop-blur-3xl text-white p-1 rounded-lg bg-clip-border">
      <h3 className="font-bold">RAG Assistant</h3>

      <div className="flex-1 overflow-y-auto space-y-2 p-3">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-[80%] text-sm ${msg.role === "user"
              ? "bg-blue-500 self-end ml-auto"
              : "bg-gray-700 self-start"
              }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-700 p-2 rounded w-fit">
            Bot is thinking...
          </div>
        )}
        <div ref={chatEndRef}></div>
        {/* {topChunks.map(c => (
          <div className="text-xs text-gray-400 min-h-2 border">
            {c.text}
          </div>
        ))} */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-gray-800 text-white p-1 rounded"
        >
          <option value="ask">Ask</option>
          <option value="summarize">Summarize</option>
          <option value="keypoints">Key Points</option>
        </select>
      </div>

      <div className="flex gap-2 p-3 border-t border-gray-700 bg-blue-950">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          className="flex-1 p-2 rounded bg-gray-800 outline-none text-sm"
          placeholder="Ask something..."
        />

        <button
          onClick={ask}
          className="bg-blue-500 px-4 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;