import { useState } from "react";

const API_URL = "http://127.0.0.1:8015/chat";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Academy AI. Ask me about admissions, courses, tuition, schedules, or student support.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event) {
    event.preventDefault();

    const userMessage = message.trim();
    if (!userMessage || isLoading) {
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: userMessage },
    ]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The backend could not answer right now.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach the backend on port 8015.";

      setError(errorMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "I could not connect to the AI service. Please check that the backend is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-panel">
        <header className="app-header">
          <p>ZubevisionTechnology</p>
          <h1>Academy AI Assistant</h1>
          <span>
            Student support for admissions, courses, tuition, schedules, and academy questions.
          </span>
        </header>

        <div className="messages" aria-live="polite">
          {messages.map((chatMessage, index) => (
            <div
              className={`message-row ${chatMessage.role === "user" ? "user" : "assistant"}`}
              key={`${chatMessage.role}-${index}`}
            >
              <div className="message-bubble">{chatMessage.content}</div>
            </div>
          ))}
          {isLoading ? <div className="loading">Academy AI is thinking...</div> : null}
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about admissions, courses, tuition, or schedules"
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
