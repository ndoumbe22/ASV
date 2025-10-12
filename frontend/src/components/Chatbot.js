import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import chatbotService from "../services/chatbotService";
import "./Chatbot.css";

function Chatbot({ show, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { sender: "user", text: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(inputMessage);
      const botResponse =
        response.responses && response.responses.length > 0
          ? response.responses[0].text
          : "Désolé, je n'ai pas compris.";

      // Add bot response to chat
      const botMessage = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Erreur de connexion. Veuillez réessayer.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setInputMessage("");
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await chatbotService.getHistory();
      setHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      alert("Erreur lors du chargement de l'historique");
    }
  };

  const closeHistory = () => {
    setShowHistory(false);
    setHistory([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // If show prop is not provided, use internal state
  const isShown = show !== undefined ? show : true;
  const handleClose = onClose || (() => {});

  return (
    <>
      {/* Chatbot Modal */}
      <Modal show={isShown} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-robot me-2"></i>
            Assistant Médical
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h5>Bonjour ! 👋</h5>
                  <p>
                    Je suis votre assistant médical virtuel. Comment puis-je
                    vous aider aujourd'hui ?
                  </p>
                  <div className="suggestions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        setInputMessage("Quels sont vos services ?")
                      }
                    >
                      Quels sont vos services ?
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        setInputMessage("Comment prendre un rendez-vous ?")
                      }
                    >
                      Prendre un rendez-vous
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        setInputMessage("Quels sont les horaires ?")
                      }
                    >
                      Horaires d'ouverture
                    </Button>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="message-content">{msg.text}</div>
                  </div>
                ))
              )}
              {loading && (
                <div className="message bot">
                  <div className="message-content">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">En train d'écrire...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={loadHistory}>
            <i className="bi bi-clock-history me-1"></i>
            Historique
          </Button>
          <Form onSubmit={handleSubmit} className="flex-grow-1">
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Tapez votre message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !inputMessage.trim()}
              >
                <i className="bi bi-send"></i>
              </Button>
            </div>
          </Form>
        </Modal.Footer>
      </Modal>

      {/* History Modal */}
      <Modal show={showHistory} onHide={closeHistory} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-clock-history me-2"></i>
            Historique des Conversations
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {history.length === 0 ? (
            <p className="text-center text-muted">
              Aucun historique de conversation trouvé.
            </p>
          ) : (
            <div className="history-container">
              {history.map((conv) => (
                <div key={conv.id} className="history-item">
                  <div className="user-message">
                    <strong>Vous :</strong> {conv.message_user}
                  </div>
                  <div className="bot-message mt-1">
                    <strong>Assistant :</strong> {conv.message_bot}
                  </div>
                  <div className="timestamp text-muted small">
                    {new Date(conv.timestamp).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHistory}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Chatbot;
