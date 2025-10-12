import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message to backend API
      const response = await axios.post("/chatbot/", {
        message: inputMessage
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      // Add bot response to chat
      const botResponse = {
        id: messages.length + 2,
        text: response.data.responses?.[0]?.text || "Désolé, je n'ai pas compris. Pouvez-vous reformuler ?",
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message au chatbot :", error);
      
      // Add error message to chat
      const errorMessage = {
        id: messages.length + 2,
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Quick replies for common questions
  const quickReplies = [
    "J'ai mal à la tête",
    "Quels sont les symptômes du paludisme ?",
    "Comment prendre rendez-vous ?",
    "Quelles sont vos heures d'ouverture ?"
  ];

  const handleQuickReply = (message) => {
    setInputMessage(message);
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
        style={{ width: "60px", height: "60px" }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Chat header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2" />
              <h3 className="font-semibold">Assistant Virtuel</h3>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <FaRobot size={16} className="text-green-600" />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm">
                      <p className="text-gray-800">{message.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
                
                {message.sender === "user" && (
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-lg rounded-tr-none p-3 max-w-xs shadow-sm">
                      <p className="text-gray-800">{message.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-gray-700 font-semibold">U</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex mb-4 justify-start">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <FaRobot size={16} className="text-green-600" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {!isLoading && messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions rapides :</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;