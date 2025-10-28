import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { consultationAPI, consultationMessageAPI } from "../../services/api";
import webSocketService from "../../services/webSocketService";
import { toast } from "react-toastify";
import {
  FaVideo,
  FaMicrophone,
  FaPhone,
  FaPaperclip,
  FaPaperPlane,
  FaFileMedical,
  FaUserMd,
  FaUser,
  FaVideoSlash,
  FaMicrophoneSlash,
} from "react-icons/fa";
// Try importing the CSS differently
import "./ConsultationPage.css";

function ConsultationPage() {
  const { id } = useParams(); // Consultation ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const messagesEndRef = useRef(null);

  // Video state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Check user role
  useEffect(() => {
    if (user) {
      setIsDoctor(user.role === "medecin");
      setIsPatient(user.role === "patient");
    }
  }, [user]);

  // Load consultation details
  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const response = await consultationAPI.getConsultation(id);
        setConsultation(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement de la consultation");
        toast.error("Erreur lors du chargement de la consultation");
        setLoading(false);
      }
    };

    if (id) {
      loadConsultation();
    }
  }, [id]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!user || !id) return;

    // Connect to WebSocket
    const wsUrl = `ws://localhost:8000/ws/consultation/${id}/${user.id}/`;
    webSocketService.connect(wsUrl);

    // Listen for messages
    webSocketService.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load initial messages
    const loadMessages = async () => {
      try {
        const response = await consultationMessageAPI.getMessages(id);
        setMessages(response.data);
      } catch (err) {
        console.error("Error loading messages:", err);
        toast.error("Erreur lors du chargement des messages");
      }
    };

    if (consultation) {
      loadMessages();
    }

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
      stopMediaTracks();
    };
  }, [consultation, id, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize video when component mounts
  useEffect(() => {
    initializeMedia();
    return () => {
      stopMediaTracks();
    };
  }, []);

  // Set up video elements when streams are available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Impossible d'accéder à la caméra ou au microphone");
    }
  };

  const stopMediaTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startCall = async () => {
    try {
      // In a real implementation, this would set up a WebRTC connection
      // For now, we'll just simulate starting a call
      setIsInCall(true);
      toast.success("Appel démarré");

      // Simulate receiving remote stream after a short delay
      // In a real implementation, this would come from WebRTC
      setTimeout(() => {
        setRemoteStream(localStream);
        if (remoteVideoRef.current && localStream) {
          remoteVideoRef.current.srcObject = localStream;
        }
      }, 1000);
    } catch (err) {
      console.error("Error starting call:", err);
      toast.error("Erreur lors du démarrage de l'appel");
    }
  };

  const endCall = async () => {
    try {
      // In a real implementation, this would close the WebRTC connection
      setIsInCall(false);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      toast.success("Appel terminé");
    } catch (err) {
      console.error("Error ending call:", err);
      toast.error("Erreur lors de la fin de l'appel");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Send message through WebSocket
      webSocketService.send({
        content: newMessage,
      });

      // Clear input
      setNewMessage("");
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const handleEndConsultation = async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir terminer cette consultation ?")
    ) {
      try {
        // End the call first if in progress
        if (isInCall) {
          endCall();
        }

        await consultationAPI.endConsultation(id);
        toast.success("Consultation terminée avec succès");
        navigate(
          isDoctor ? "/medecin/consultations" : "/patient/consultations"
        );
      } catch (err) {
        toast.error("Erreur lors de la fin de la consultation");
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="consultation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de la consultation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultation-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-page">
      {/* Header */}
      <div className="consultation-header">
        <div className="header-info">
          <h2>Consultation en ligne</h2>
          <div className="consultation-details">
            <div className="detail-item">
              <FaUserMd className="detail-icon" />
              <span>
                {isDoctor
                  ? `${consultation?.patient?.user?.first_name} ${consultation?.patient?.user?.last_name}`
                  : `Dr. ${consultation?.medecin?.user?.first_name} ${consultation?.medecin?.user?.last_name}`}
              </span>
            </div>
            <div className="detail-item">
              <FaFileMedical className="detail-icon" />
              <span>
                {consultation?.date} à {consultation?.heure}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${
              isVideoEnabled ? "btn-success" : "btn-secondary"
            }`}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />} Vidéo
          </button>
          <button
            className={`btn ${isAudioEnabled ? "btn-info" : "btn-secondary"}`}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />} Audio
          </button>
          {!isInCall ? (
            <button className="btn btn-success" onClick={startCall}>
              <FaPhone /> Démarrer l'appel
            </button>
          ) : (
            <button className="btn btn-danger" onClick={endCall}>
              <FaPhone /> Terminer l'appel
            </button>
          )}
          <button className="btn btn-danger" onClick={handleEndConsultation}>
            <FaPhone /> Terminer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="consultation-content">
        {/* Video Container */}
        <div className="video-container">
          {/* Remote Video */}
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            <div className="remote-video-overlay">
              {isDoctor
                ? `${consultation?.patient?.user?.first_name} ${consultation?.patient?.user?.last_name}`
                : `Dr. ${consultation?.medecin?.user?.first_name} ${consultation?.medecin?.user?.last_name}`}
            </div>
          </div>

          {/* Local Video */}
          <div className="local-video-container">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
            <div className="local-video-overlay">
              {isDoctor
                ? `Dr. ${consultation?.medecin?.user?.first_name} ${consultation?.medecin?.user?.last_name}`
                : `${consultation?.patient?.user?.first_name} ${consultation?.patient?.user?.last_name}`}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id || message.timestamp}
                className={`message ${
                  message.sender === user.id ? "sent" : "received"
                }`}
              >
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">
                      {message.sender_name ||
                        (message.sender === user.id
                          ? user.first_name + " " + user.last_name
                          : isDoctor
                          ? `${consultation?.patient?.user?.first_name} ${consultation?.patient?.user?.last_name}`
                          : `Dr. ${consultation?.medecin?.user?.first_name} ${consultation?.medecin?.user?.last_name}`)}
                    </span>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            className="message-input-container"
            onSubmit={handleSendMessage}
          >
            <div className="input-group">
              <button type="button" className="btn btn-outline-secondary">
                <FaPaperclip />
              </button>
              <input
                type="text"
                className="form-control"
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="consultation-sidebar">
          <div className="sidebar-section">
            <h5>Participants</h5>
            <div className="participants-list">
              <div className="participant">
                <div className="participant-avatar">
                  {isDoctor ? <FaUser /> : <FaUserMd />}
                </div>
                <div className="participant-info">
                  <div className="participant-name">
                    {isDoctor
                      ? `${consultation?.patient?.user?.first_name} ${consultation?.patient?.user?.last_name}`
                      : `Dr. ${consultation?.medecin?.user?.first_name} ${consultation?.medecin?.user?.last_name}`}
                  </div>
                  <div className="participant-status online">En ligne</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h5>Informations</h5>
            <div className="info-item">
              <strong>Statut:</strong>
              <span className="status-badge active">En cours</span>
            </div>
            <div className="info-item">
              <strong>Début:</strong>
              <span>
                {consultation?.date} {consultation?.heure}
              </span>
            </div>
            <div className="info-item">
              <strong>Durée:</strong>
              <span>15 minutes</span>
            </div>
          </div>

          <div className="sidebar-section">
            <h5>Actions</h5>
            <button className="btn btn-outline-primary btn-block mb-2">
              Partager un document
            </button>
            <button className="btn btn-outline-secondary btn-block">
              Prescrire un médicament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultationPage;
