import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import User, Message, Conversation
from django.utils import timezone

class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'user_{self.user_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        conversation_id = text_data_json['conversation_id']
        
        # Save message to database
        saved_message = await self.save_message(message, conversation_id)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'conversation_id': conversation_id,
                'sender_id': self.user_id,
                'timestamp': saved_message.timestamp.isoformat(),
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'conversation_id': event['conversation_id'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, content, conversation_id):
        """Save message to database"""
        user = User.objects.get(id=self.user_id)
        conversation = Conversation.objects.get(id=conversation_id)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content
        )
        
        # Update conversation timestamp
        conversation.updated_at = message.timestamp
        conversation.save()
        
        return message