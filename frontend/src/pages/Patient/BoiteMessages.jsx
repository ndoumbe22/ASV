import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaTrash, FaReply, FaSearch, FaFilter } from "react-icons/fa";

function BoiteMessages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", content: "" });
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Dans une vraie application, ces données viendraient de l'API
        // Pour l'instant, utilisons des données statiques
        const mockMessages = [
          {
            id: 1,
            from: "Dr. Ibrahim Dia",
            to: "Awa Diop",
            subject: "Résultats d'analyse",
            content: "Bonjour Mme Diop, les résultats de vos analyses sanguines sont disponibles. Tout est normal. Je vous attends pour la consultation de suivi la semaine prochaine.",
            date: "2023-10-15T14:30:00",
            read: true,
            folder: "inbox"
          },
          {
            id: 2,
            from: "Service Médical",
            to: "Awa Diop",
            subject: "Rappel de rendez-vous",
            content: "Bonjour, nous vous rappelons votre rendez-vous avec Dr. Fatou Ndiaye le 20 octobre 2023 à 10h00. Merci d'arriver 15 minutes à l'avance.",
            date: "2023-10-16T09:15:00",
            read: false,
            folder: "inbox"
          },
          {
            id: 3,
            from: "Awa Diop",
            to: "Dr. Mamadou Fall",
            subject: "Question sur mon traitement",
            content: "Bonjour Docteur, je voulais savoir si les effets secondaires que je ressens avec le propranolol sont normaux. J'ai parfois des vertiges le matin.",
            date: "2023-10-14T11:20:00",
            read: true,
            folder: "sent"
          },
          {
            id: 4,
            from: "Support HealthMeet",
            to: "Awa Diop",
            subject: "Confirmation de votre compte",
            content: "Bonjour, votre compte HealthMeet a été créé avec succès. Vous pouvez maintenant prendre des rendez-vous et accéder à votre dossier médical en ligne.",
            date: "2023-10-10T08:45:00",
            read: true,
            folder: "inbox"
          }
        ];
        
        setMessages(mockMessages);
        setFilteredMessages(mockMessages);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des messages");
        setLoading(false);
        console.error("Erreur lors du chargement des messages :", err);
      }
    };

    fetchMessages();
  }, []);

  // Filtrer les messages selon la recherche et le filtre
  useEffect(() => {
    let result = messages;
    
    // Filtrer selon la recherche
    if (searchTerm) {
      result = result.filter(message => 
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.from.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer selon le type
    if (filter !== "all") {
      result = result.filter(message => message.folder === filter);
    }
    
    setFilteredMessages(result);
  }, [searchTerm, filter, messages]);

  const handleDeleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // await axios.post('/api/messages/', newMessage, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ajouter le message à la liste (simulation)
      const sentMessage = {
        id: messages.length + 1,
        from: "Awa Diop",
        to: newMessage.to,
        subject: newMessage.subject,
        content: newMessage.content,
        date: new Date().toISOString(),
        read: false,
        folder: "sent"
      };
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage({ to: "", subject: "", content: "" });
      setShowCompose(false);
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
      console.error("Erreur lors de l'envoi du message :", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (id) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
    
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prev => ({ ...prev, read: true }));
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <button 
                className="btn btn-success w-100 mb-4"
                onClick={() => setShowCompose(true)}
              >
                <FaPaperPlane className="me-2" /> Nouveau message
              </button>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Boîte de réception</h5>
                  <span className="badge bg-success">
                    {messages.filter(m => m.folder === "inbox" && !m.read).length}
                  </span>
                </div>
                
                <ul className="list-group">
                  <li 
                    className={`list-group-item ${filter === "all" ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("all")}
                  >
                    Tous les messages
                  </li>
                  <li 
                    className={`list-group-item ${filter === "inbox" ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("inbox")}
                  >
                    Boîte de réception
                  </li>
                  <li 
                    className={`list-group-item ${filter === "sent" ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("sent")}
                  >
                    Messages envoyés
                  </li>
                </ul>
              </div>
              
              <div>
                <h5>Filtres</h5>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Liste des messages */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Messages</h5>
                <button className="btn btn-sm btn-outline-secondary">
                  <FaFilter />
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {filteredMessages.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-muted">Aucun message trouvé</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`list-group-item ${selectedMessage && selectedMessage.id === message.id ? "active" : ""} ${!message.read ? "fw-bold" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) markAsRead(message.id);
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {message.folder === "inbox" ? message.from : `À: ${message.to}`}
                            </div>
                            {!message.read && (
                              <span className="badge bg-success rounded-pill">●</span>
                            )}
                          </div>
                          <div className="small text-muted">{message.subject}</div>
                        </div>
                        <div className="text-muted small">
                          {formatDate(message.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenu du message */}
        <div className="col-md-5">
          {selectedMessage ? (
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{selectedMessage.subject}</h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2">
                    <FaReply />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <strong>
                      {selectedMessage.folder === "inbox" ? selectedMessage.from : `À: ${selectedMessage.to}`}
                    </strong>
                    <div className="small text-muted">
                      {formatDate(selectedMessage.date)}
                    </div>
                  </div>
                </div>
                <div className="border-top pt-3">
                  {selectedMessage.content}
                </div>
                <div className="mt-4">
                  <button className="btn btn-success">
                    <FaReply className="me-2" /> Répondre
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <div className="mb-3">
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }} className="mx-auto">
                      <FaPaperPlane size={40} color="#2E7D32" />
                    </div>
                  </div>
                  <h5>Sélectionnez un message</h5>
                  <p className="text-muted">Choisissez un message dans la liste pour le lire</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de composition */}
      {showCompose && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau message</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCompose(false)}
                ></button>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">À</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newMessage.to}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, to: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sujet</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="8"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCompose(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    <FaPaperPlane className="me-2" /> Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoiteMessages;