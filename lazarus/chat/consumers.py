import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from django.utils.timesince import timesince

from .templatetags.chatextras import inicials


import logging

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.DEBUG)

        logger.debug("Client connected to WebSocket")

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        logger.debug(f"Joining room group: {self.room_group_name}")
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        logger.debug(f"Leaving room group: {self.room_group_name}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Called when a message is received from the WebSocket.
        """
        logger.debug(f"Received message: {text_data}")

        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        message = text_data_json['message']
        name = text_data_json['name']
        agent = text_data_json.get('agent', '')

        logger.debug(f"Message type: {type}")
        logger.debug(f"Message content: {message}")
        logger.debug(f"User name: {name}")
        logger.debug(f"Agent: {agent}")

        if type == 'message':
            # Send message to room or group
            await self.channel_layer.group_send(
                self.room_group_name, {
                    'type': 'chat_message',
                    'message': message,
                    'name': name,
                    'agent': agent,
                    'inicials': inicials(name),
                    'created_at': '',  # timesince(new_message.created_at)
                }
            )

    async def chat_message(self, event):
        """
        Called when a 'chat_message' event is received from the room group.
        """
        # Send message to WebSocket
        logger.debug(f"Sending message to client: {event}")
        await self.send(text_data=json.dumps(event))
