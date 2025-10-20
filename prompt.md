🔧 Instructions Complètes pour Qoder AI - Correction du Système de Messagerie
🎯 PROBLÈME PRINCIPAL
Le système de messagerie entre patients et médecins ne fonctionne pas correctement.

📋 ANALYSE DU SYSTÈME ACTUEL
Architecture Existante :

Backend : Django REST avec endpoints de messagerie
Frontend : 2 composants (Patient/Messagerie.jsx et Medecin/Messagerie.jsx)
Modèles : Conversation (many-to-many participants) + Message (sender, content, read status)
Authentification : JWT avec permissions par rôle

Problèmes Identifiés :

❌ Pas de WebSocket pour temps réel
❌ Gestion d'erreurs incomplète
❌ Notifications manquantes
❌ Indicateurs de statut message manquants
❌ Interface peut-être non intuitive

🛠️ SOLUTIONS COMPLÈTES À IMPLÉMENTER
PHASE 1 : CORRIGER LE BACKEND (Priorité Haute)
pythonFICHIER : backend/api/views.py

1️⃣ AMÉLIORER get_conversations :

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
"""Récupérer toutes les conversations de l'utilisateur"""
try:
user = request.user

        # Récupérer conversations avec préchargement des relations
        conversations = Conversation.objects.filter(
            participants=user
        ).prefetch_related('participants').annotate(
            unread_count=Count(
                'messages',
                filter=Q(messages__is_read=False) & ~Q(messages__sender=user)
            )
        ).order_by('-updated_at')

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data, status=200)

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la récupération des conversations: {str(e)}"},
            status=500
        )

2️⃣ AMÉLIORER get_messages :

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
"""Récupérer les messages d'une conversation"""
try:
user = request.user

        # Vérifier que la conversation existe et que l'utilisateur y participe
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation non trouvée ou accès non autorisé"},
                status=404
            )

        # Récupérer les messages triés par date
        messages = Message.objects.filter(
            conversation=conversation
        ).select_related('sender').order_by('created_at')

        # Marquer les messages non lus comme lus
        unread_messages = messages.filter(is_read=False).exclude(sender=user)
        unread_messages.update(is_read=True, read_at=timezone.now())

        serializer = MessageSerializer(
            messages,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data, status=200)

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la récupération des messages: {str(e)}"},
            status=500
        )

3️⃣ AMÉLIORER create_conversation :

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
"""Créer une nouvelle conversation"""
try:
user = request.user
participant_id = request.data.get('participant_id')

        if not participant_id:
            return Response(
                {"error": "ID du participant requis"},
                status=400
            )

        # Vérifier que le participant existe
        try:
            participant = User.objects.get(id=participant_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Utilisateur non trouvé"},
                status=404
            )

        # Vérifier les rôles (patient <-> médecin uniquement)
        if user.role == participant.role:
            return Response(
                {"error": "Une conversation doit être entre un patient et un médecin"},
                status=400
            )

        # Vérifier si une conversation existe déjà entre ces 2 utilisateurs
        existing_conversation = Conversation.objects.filter(
            participants=user
        ).filter(
            participants=participant
        ).first()

        if existing_conversation:
            serializer = ConversationSerializer(
                existing_conversation,
                context={'request': request}
            )
            return Response(
                {
                    "message": "Conversation existante trouvée",
                    "conversation": serializer.data
                },
                status=200
            )

        # Créer nouvelle conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(user, participant)
        conversation.save()

        serializer = ConversationSerializer(
            conversation,
            context={'request': request}
        )

        return Response(
            {
                "message": "Conversation créée avec succès",
                "conversation": serializer.data
            },
            status=201
        )

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la création de la conversation: {str(e)}"},
            status=500
        )

4️⃣ AMÉLIORER send_message (DÉJÀ BON, mais ajouter validation) :

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
"""Envoyer un nouveau message"""
try:
conversation_id = request.data.get('conversation_id')
content = request.data.get('content', '').strip()

        # Validation
        if not conversation_id:
            return Response(
                {"error": "ID de conversation requis"},
                status=400
            )

        if not content:
            return Response(
                {"error": "Le contenu du message ne peut pas être vide"},
                status=400
            )

        if len(content) > 5000:
            return Response(
                {"error": "Le message est trop long (max 5000 caractères)"},
                status=400
            )

        # Vérifier que la conversation existe et que l'utilisateur y participe
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation non trouvée ou accès non autorisé"},
                status=404
            )

        # Créer le message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
            is_read=False
        )

        # Mettre à jour le timestamp de la conversation
        conversation.updated_at = timezone.now()
        conversation.save()

        serializer = MessageSerializer(message, context={'request': request})

        return Response(
            {
                "message": "Message envoyé avec succès",
                "data": serializer.data
            },
            status=201
        )

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de l'envoi du message: {str(e)}"},
            status=500
        )

5️⃣ AMÉLIORER get_unread_count :

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
"""Obtenir le nombre de messages non lus"""
try:
user = request.user

        # Compter les messages non lus où l'utilisateur n'est PAS l'expéditeur
        unread_count = Message.objects.filter(
            conversation__participants=user,
            is_read=False
        ).exclude(sender=user).count()

        return Response(
            {"unread_count": unread_count},
            status=200
        )

    except Exception as e:
        return Response(
            {"error": f"Erreur lors du comptage: {str(e)}"},
            status=500
        )

PHASE 2 : AMÉLIORER LES SERIALIZERS
pythonFICHIER : backend/api/serializers.py

1️⃣ AMÉLIORER ConversationSerializer :

class ConversationSerializer(serializers.ModelSerializer):
participant_info = serializers.SerializerMethodField()
last_message = serializers.SerializerMethodField()
last_message_time = serializers.SerializerMethodField()
unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'participant_info',
            'last_message',
            'last_message_time',
            'unread_count',
            'created_at',
            'updated_at'
        ]

    def get_participant_info(self, obj):
        """Retourner les infos de l'autre participant"""
        request = self.context.get('request')
        if not request:
            return None

        # Récupérer l'autre participant (pas l'utilisateur actuel)
        other_participant = obj.participants.exclude(id=request.user.id).first()

        if not other_participant:
            return None

        return {
            'id': other_participant.id,
            'username': other_participant.username,
            'first_name': other_participant.first_name,
            'last_name': other_participant.last_name,
            'role': other_participant.role,
            'email': other_participant.email
        }

    def get_last_message(self, obj):
        """Retourner le dernier message"""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content[:100],  # Tronquer à 100 caractères
                'sender_id': last_msg.sender.id,
                'created_at': last_msg.created_at
            }
        return None

    def get_last_message_time(self, obj):
        """Retourner le timestamp du dernier message"""
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.created_at if last_msg else obj.updated_at

    def get_unread_count(self, obj):
        """Compter les messages non lus pour l'utilisateur actuel"""
        request = self.context.get('request')
        if not request:
            return 0

        return obj.messages.filter(
            is_read=False
        ).exclude(sender=request.user).count()

2️⃣ AMÉLIORER MessageSerializer :

class MessageSerializer(serializers.ModelSerializer):
sender_name = serializers.SerializerMethodField()
sender_role = serializers.SerializerMethodField()
is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'sender_name',
            'sender_role',
            'content',
            'is_read',
            'read_at',
            'is_mine',
            'created_at'
        ]
        read_only_fields = ['sender', 'is_read', 'read_at', 'created_at']

    def get_sender_name(self, obj):
        """Retourner le nom complet de l'expéditeur"""
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.username

    def get_sender_role(self, obj):
        """Retourner le rôle de l'expéditeur"""
        return obj.sender.role

    def get_is_mine(self, obj):
        """Vérifier si le message appartient à l'utilisateur actuel"""
        request = self.context.get('request')
        if not request:
            return False
        return obj.sender.id == request.user.id

PHASE 3 : CORRIGER LE FRONTEND - API SERVICE
javascriptFICHIER : frontend/src/services/api.js

AMÉLIORER messageAPI :

export const messageAPI = {
// Récupérer toutes les conversations
getConversations: async () => {
try {
const response = await api.get("messages/conversations/");
return response;
} catch (error) {
console.error("Erreur getConversations:", error.response?.data);
throw error;
}
},

// Récupérer les messages d'une conversation
getMessages: async (conversationId) => {
try {
const response = await api.get(`messages/conversations/${conversationId}/messages/`);
return response;
} catch (error) {
console.error("Erreur getMessages:", error.response?.data);
throw error;
}
},

// Créer une nouvelle conversation
createConversation: async (participantId) => {
try {
const response = await api.post("messages/conversations/create/", {
participant_id: participantId
});
return response;
} catch (error) {
console.error("Erreur createConversation:", error.response?.data);
throw error;
}
},

// Envoyer un message
sendMessage: async (conversationId, content) => {
try {
const response = await api.post("messages/send/", {
conversation_id: conversationId,
content: content
});
return response;
} catch (error) {
console.error("Erreur sendMessage:", error.response?.data);
throw error;
}
},

// Marquer un message comme lu
markMessageAsRead: async (messageId) => {
try {
const response = await api.put(`messages/${messageId}/mark-read/`);
return response;
} catch (error) {
console.error("Erreur markMessageAsRead:", error.response?.data);
throw error;
}
},

// Obtenir le nombre de messages non lus
getUnreadCount: async () => {
try {
const response = await api.get("messages/unread-count/");
return response;
} catch (error) {
console.error("Erreur getUnreadCount:", error.response?.data);
throw error;
}
}
};

PHASE 4 : REFAIRE LE COMPOSANT PATIENT (Messagerie.jsx)
javascriptFICHIER : frontend/src/pages/Patient/Messagerie.jsx

IMPLÉMENTATION COMPLÈTE :

import React, { useState, useEffect, useRef } from 'react';
import { messageAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
Search,
Send,
User,
Clock,
CheckCheck,
MessageCircle,
Plus
} from 'lucide-react';

const Messagerie = () => {
const { user } = useAuth();
const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');
const [loading, setLoading] = useState(false);
const [sending, setSending] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [unreadCount, setUnreadCount] = useState(0);

// Pour auto-scroll vers le bas
const messagesEndRef = useRef(null);

// Pour le polling (mise à jour automatique)
const pollingIntervalRef = useRef(null);

// Charger les conversations au montage
useEffect(() => {
loadConversations();
loadUnreadCount();

    // Polling toutes les 5 secondes pour les nouveaux messages
    startPolling();

    return () => stopPolling();

}, []);

// Charger les messages quand une conversation est sélectionnée
useEffect(() => {
if (selectedConversation) {
loadMessages(selectedConversation.id);
}
}, [selectedConversation]);

// Auto-scroll vers le bas des messages
useEffect(() => {
scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const loadConversations = async () => {
try {
setLoading(true);
const response = await messageAPI.getConversations();
setConversations(response.data);
} catch (error) {
console.error("Erreur chargement conversations:", error);
toast.error("Impossible de charger les conversations");
} finally {
setLoading(false);
}
};

const loadMessages = async (conversationId) => {
try {
const response = await messageAPI.getMessages(conversationId);
setMessages(response.data);

      // Recharger les conversations pour mettre à jour unread_count
      loadConversations();
      loadUnreadCount();
    } catch (error) {
      console.error("Erreur chargement messages:", error);
      toast.error("Impossible de charger les messages");
    }

};

const loadUnreadCount = async () => {
try {
const response = await messageAPI.getUnreadCount();
setUnreadCount(response.data.unread_count);
} catch (error) {
console.error("Erreur comptage messages non lus:", error);
}
};

const handleSendMessage = async (e) => {
e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);

      const response = await messageAPI.sendMessage(
        selectedConversation.id,
        newMessage.trim()
      );

      // Ajouter le nouveau message à la liste
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');

      // Mettre à jour la liste des conversations
      loadConversations();

    } catch (error) {
      console.error("Erreur envoi message:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de l'envoi";
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }

};

const handleSelectConversation = (conversation) => {
setSelectedConversation(conversation);
setMessages([]);
};

const startPolling = () => {
pollingIntervalRef.current = setInterval(() => {
if (selectedConversation) {
loadMessages(selectedConversation.id);
}
loadUnreadCount();
}, 5000); // Toutes les 5 secondes
};

const stopPolling = () => {
if (pollingIntervalRef.current) {
clearInterval(pollingIntervalRef.current);
}
};

const filteredConversations = conversations.filter(conv => {
const participantName = conv.participant_info
? `${conv.participant_info.first_name} ${conv.participant_info.last_name}`.toLowerCase()
: '';
return participantName.includes(searchQuery.toLowerCase());
});

const formatTime = (dateString) => {
const date = new Date(dateString);
const now = new Date();
const diffInHours = (now - date) / (1000 _ 60 _ 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }

};

return (
<div className="messagerie-container" style={{ height: 'calc(100vh - 100px)', display: 'flex' }}>

      {/* SIDEBAR - Liste des conversations */}
      <div className="conversations-sidebar" style={{
        width: '350px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px' }}>
            Messages
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '10px',
                background: '#ef4444',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {unreadCount}
              </span>
            )}
          </h2>

          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
            />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Chargement...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              <MessageCircle size={48} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p>Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conv.id ? '#f0f9ff' : 'white',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {conv.participant_info?.first_name?.[0] || 'U'}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        Dr. {conv.participant_info?.first_name} {conv.participant_info?.last_name}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>

                    <p style={{
                      margin: '4px 0 0',
                      fontSize: '14px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conv.last_message?.content || 'Aucun message'}
                    </p>
                  </div>

                  {/* Badge non lu */}
                  {conv.unread_count > 0 && (
                    <div style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ZONE DE MESSAGES */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {selectedConversation ? (
          <>
            {/* Header conversation */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600'
              }}>
                {selectedConversation.participant_info?.first_name?.[0] || 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Dr. {selectedConversation.participant_info?.first_name} {selectedConversation.participant_info?.last_name}
                </h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                  {selectedConversation.participant_info?.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
                  <MessageCircle size={64} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                  <p>Aucun message dans cette conversation</p>
                  <p style={{ fontSize: '14px' }}>Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: msg.is_mine ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      background: msg.is_mine ? '#3b82f6' : 'white',
                      color: msg.is_mine ? 'white' : '#1f2937',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>
                        {msg.content}
                      </p>
                      <div style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px'
                      }}>
                        <Clock size={12} />
                        {formatTime(msg.created_at)}
                        {msg.is_mine && msg.is_read && <CheckCheck size={14} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '24px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  styleRéessayerClaude n'a pas encore la capacité d'exécuter le code qu'il génère.MContinuerjavascript                  style={{
                    padding: '12px 24px',
                    background: !newMessage.trim() || sending ? '#e5e7eb' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim() && !sending) {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim() && !sending) {
                      e.currentTarget.style.background = '#3b82f6';
                    }
                  }}
                >
                  <Send size={18} />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </>
        ) : (
          // État vide : aucune conversation sélectionnée
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#9ca3af'
          }}>
            <MessageCircle size={80} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Messagerie Patient</h3>
            <p style={{ fontSize: '14px' }}>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>

);
};

export default Messagerie;

PHASE 5 : REFAIRE LE COMPOSANT MÉDECIN (Messagerie.jsx)
javascriptFICHIER : frontend/src/pages/Medecin/Messagerie.jsx

IMPLÉMENTATION COMPLÈTE (similaire au patient) :

import React, { useState, useEffect, useRef } from 'react';
import { messageAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
Search,
Send,
User,
Clock,
CheckCheck,
MessageCircle,
Plus,
Users
} from 'lucide-react';

const Messagerie = () => {
const { user } = useAuth();
const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');
const [loading, setLoading] = useState(false);
const [sending, setSending] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [unreadCount, setUnreadCount] = useState(0);
const [showNewConversation, setShowNewConversation] = useState(false);
const [patients, setPatients] = useState([]);

const messagesEndRef = useRef(null);
const pollingIntervalRef = useRef(null);

useEffect(() => {
loadConversations();
loadUnreadCount();
loadPatients(); // Charger la liste des patients pour nouvelle conversation
startPolling();

    return () => stopPolling();

}, []);

useEffect(() => {
if (selectedConversation) {
loadMessages(selectedConversation.id);
}
}, [selectedConversation]);

useEffect(() => {
scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const loadConversations = async () => {
try {
setLoading(true);
const response = await messageAPI.getConversations();
setConversations(response.data);
} catch (error) {
console.error("Erreur chargement conversations:", error);
toast.error("Impossible de charger les conversations");
} finally {
setLoading(false);
}
};

const loadMessages = async (conversationId) => {
try {
const response = await messageAPI.getMessages(conversationId);
setMessages(response.data);
loadConversations();
loadUnreadCount();
} catch (error) {
console.error("Erreur chargement messages:", error);
toast.error("Impossible de charger les messages");
}
};

const loadUnreadCount = async () => {
try {
const response = await messageAPI.getUnreadCount();
setUnreadCount(response.data.unread_count);
} catch (error) {
console.error("Erreur comptage messages non lus:", error);
}
};

const loadPatients = async () => {
try {
// Adapter selon votre API - récupérer la liste des patients
const response = await userAPI.getUsers({ role: 'PATIENT' });
setPatients(response.data);
} catch (error) {
console.error("Erreur chargement patients:", error);
}
};

const handleCreateConversation = async (patientId) => {
try {
const response = await messageAPI.createConversation(patientId);

      if (response.data.conversation) {
        toast.success(response.data.message);
        setShowNewConversation(false);
        loadConversations();
        setSelectedConversation(response.data.conversation);
      }
    } catch (error) {
      console.error("Erreur création conversation:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de la création";
      toast.error(errorMsg);
    }

};

const handleSendMessage = async (e) => {
e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);

      const response = await messageAPI.sendMessage(
        selectedConversation.id,
        newMessage.trim()
      );

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      loadConversations();

    } catch (error) {
      console.error("Erreur envoi message:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de l'envoi";
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }

};

const handleSelectConversation = (conversation) => {
setSelectedConversation(conversation);
setMessages([]);
setShowNewConversation(false);
};

const startPolling = () => {
pollingIntervalRef.current = setInterval(() => {
if (selectedConversation) {
loadMessages(selectedConversation.id);
}
loadUnreadCount();
}, 5000);
};

const stopPolling = () => {
if (pollingIntervalRef.current) {
clearInterval(pollingIntervalRef.current);
}
};

const filteredConversations = conversations.filter(conv => {
const participantName = conv.participant_info
? `${conv.participant_info.first_name} ${conv.participant_info.last_name}`.toLowerCase()
: '';
return participantName.includes(searchQuery.toLowerCase());
});

const formatTime = (dateString) => {
const date = new Date(dateString);
const now = new Date();
const diffInHours = (now - date) / (1000 _ 60 _ 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }

};

return (
<div className="messagerie-container" style={{ height: 'calc(100vh - 100px)', display: 'flex' }}>

      {/* SIDEBAR - Liste des conversations */}
      <div className="conversations-sidebar" style={{
        width: '350px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
              Messages
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '10px',
                  background: '#ef4444',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  {unreadCount}
                </span>
              )}
            </h2>

            {/* Bouton nouvelle conversation */}
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
            />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Modal nouvelle conversation */}
        {showNewConversation && (
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f0f9ff'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
              Nouvelle conversation
            </h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {patients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => handleCreateConversation(patient.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '5px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {patient.first_name?.[0] || 'P'}
                    </div>
                    <span style={{ fontSize: '14px' }}>
                      {patient.first_name} {patient.last_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Chargement...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              <MessageCircle size={48} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p>Aucune conversation</p>
              <button
                onClick={() => setShowNewConversation(true)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Commencer une conversation
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conv.id ? '#f0f9ff' : 'white',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {conv.participant_info?.first_name?.[0] || 'P'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conv.participant_info?.first_name} {conv.participant_info?.last_name}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>

                    <p style={{
                      margin: '4px 0 0',
                      fontSize: '14px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conv.last_message?.content || 'Aucun message'}
                    </p>
                  </div>

                  {conv.unread_count > 0 && (
                    <div style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ZONE DE MESSAGES - Identique au composant patient */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {selectedConversation ? (
          <>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600'
              }}>
                {selectedConversation.participant_info?.first_name?.[0] || 'P'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {selectedConversation.participant_info?.first_name} {selectedConversation.participant_info?.last_name}
                </h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                  Patient
                </p>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
                  <MessageCircle size={64} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                  <p>Aucun message dans cette conversation</p>
                  <p style={{ fontSize: '14px' }}>Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: msg.is_mine ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      background: msg.is_mine ? '#10b981' : 'white',
                      color: msg.is_mine ? 'white' : '#1f2937',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>
                        {msg.content}
                      </p>
                      <div style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px'
                      }}>
                        <Clock size={12} />
                        {formatTime(msg.created_at)}
                        {msg.is_mine && msg.is_read && <CheckCheck size={14} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '24px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  style={{
                    padding: '12px 24px',
                    background: !newMessage.trim() || sending ? '#e5e7eb' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                >
                  <Send size={18} />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#9ca3af'
          }}>
            <Users size={80} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Messagerie Médecin</h3>
            <p style={{ fontSize: '14px' }}>Sélectionnez une conversation ou démarrez-en une nouvelle</p>
          </div>
        )}
      </div>
    </div>

);
};

export default Messagerie;

```

---

## 🚀 PLAN D'ACTION COMPLET POUR QODER AI
```

ORDRE D'IMPLÉMENTATION :

PHASE 1 - BACKEND (30 min) :
✅ Ouvre backend/api/views.py
✅ Remplace TOUTES les fonctions de messagerie par les nouvelles versions
✅ Teste chaque endpoint avec Postman :

- GET /api/messages/conversations/
- GET /api/messages/conversations/1/messages/
- POST /api/messages/conversations/create/ (body: {"participant_id": 2})
- POST /api/messages/send/ (body: {"conversation_id": 1, "content": "Test"})
- GET /api/messages/unread-count/

PHASE 2 - SERIALIZERS (10 min) :
✅ Ouvre backend/api/serializers.py
✅ Remplace ConversationSerializer et MessageSerializer
✅ Vérifie que les imports sont corrects

PHASE 3 - FRONTEND API (5 min) :
✅ Ouvre frontend/src/services/api.js
✅ Remplace la section messageAPI complète
✅ Vérifie que l'intercepteur JWT est actif

PHASE 4 - COMPOSANT PATIENT (20 min) :
✅ Ouvre frontend/src/pages/Patient/Messagerie.jsx
✅ Remplace TOUT le contenu par le nouveau code
✅ Vérifie les imports (lucide-react, toast, etc.)
✅ Adapte les couleurs au design si besoin

PHASE 5 - COMPOSANT MÉDECIN (20 min) :
✅ Ouvre frontend/src/pages/Medecin/Messagerie.jsx
✅ Remplace TOUT le contenu par le nouveau code
✅ Vérifie que userAPI.getUsers() existe (sinon crée-le)

PHASE 6 - TESTS (15 min) :
✅ Connecte-toi en tant que PATIENT
✅ Vérifie que les conversations s'affichent
✅ Sélectionne une conversation
✅ Envoie un message
✅ Vérifie qu'il apparaît
✅ Déconnecte et connecte en MÉDECIN
✅ Vérifie que le message est reçu
✅ Réponds au message
✅ Vérifie que le patient le reçoit (après 5 sec de polling)
✅ Teste la création de nouvelle conversation (médecin)

TOTAL : ~100 minutes

```

---

## 🔍 DEBUGGING
```

SI ÇA NE MARCHE PAS :

1️⃣ VÉRIFIER BACKEND :

- Console Django : regarde les erreurs
- Postman : teste les endpoints un par un
- Base de données : vérifie que Conversation et Message existent

2️⃣ VÉRIFIER FRONTEND :

- Console navigateur : regarde les erreurs
- Network tab : vérifie les requêtes (status 200/201 ?)
- Vérifie que le token JWT est dans le header Authorization

3️⃣ PROBLÈMES COURANTS :

❌ "participant_info is undefined"
✅ Solution : Vérifier que ConversationSerializer.get_participant_info() retourne bien un dict

❌ "Cannot read property 'first_name' of null"
✅ Solution : Ajouter des vérifications : conv.participant_info?.first_name

❌ "Conversation not found"
✅ Solution : Vérifier que l'utilisateur est bien dans participants

❌ Messages ne s'actualisent pas
✅ Solution : Vérifier que le polling fonctionne (interval de 5 sec)

❌ "Network Error"
✅ Solution : Vérifier l'URL de l'API (http://localhost:8000/api/)

4️⃣ LOGS À AJOUTER (temporairement) :

Dans les composants React :
console.log("Conversations:", conversations);
console.log("Selected conversation:", selectedConversation);
console.log("Messages:", messages);
console.log("Sending message:", newMessage);

Dans views.py :
print(f"User: {request.user}")
print(f"Conversations: {conversations}")
print(f"Messages: {messages}")

```

---

## ✅ CHECKLIST FINALE
```

AVANT DE VALIDER :

Backend :

- [ ] Toutes les fonctions de views.py sont à jour
- [ ] Les serializers sont modifiés
- [ ] Les URLs sont correctes (/api/messages/...)
- [ ] Les permissions IsAuthenticated sont actives
- [ ] Pas d'erreur dans la console Django

Frontend :

- [ ] messageAPI est à jour dans api.js
- [ ] Composant Patient/Messagerie.jsx est complet
- [ ] Composant Medecin/Messagerie.jsx est complet
- [ ] Les imports sont corrects (lucide-react, toast)
- [ ] Pas d'erreur dans la console navigateur

Fonctionnalités :

- [ ] Affichage liste conversations
- [ ] Sélection conversation
- [ ] Affichage messages
- [ ] Envoi message
- [ ] Réception message (après 5 sec)
- [ ] Badge messages non lus
- [ ] Marquer comme lu automatique
- [ ] Création nouvelle conversation (médecin)
- [ ] Recherche conversations
- [ ] Scroll automatique vers bas
- [ ] Interface responsive

Performance :

- [ ] Pas de lag lors de l'envoi
- [ ] Polling ne ralentit pas l'app
- [ ] Messages chargent rapidement
- [ ] Pas de memory leak (cleanup du polling)

```

---

## 💡 AMÉLIORATIONS FUTURES (Optionnel)
```

APRÈS QUE ÇA MARCHE :

1️⃣ WebSocket pour temps réel (remplacer polling)
2️⃣ Notifications push navigateur
3️⃣ Partage de fichiers/images
4️⃣ Indicateur "en train d'écrire..."
5️⃣ Emojis et formatage texte
6️⃣ Recherche dans messages
7️⃣ Archiver conversations
8️⃣ Export historique conversations

Résumé pour Qoder AI :
"Remplace complètement le système de messagerie en suivant les 5 phases dans l'ordre. Copie-colle le code backend puis frontend. Teste avec Postman, puis teste l'interface. Si erreur, regarde console backend + frontend Network tab. Le système doit permettre aux patients et médecins d'échanger des messages en temps quasi-réel (polling 5 sec). TOUT le code est fourni, il suffit de remplacer les fichiers existants." 🎯✅
