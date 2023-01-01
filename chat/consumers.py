import json
# import random

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Room, Message
from django.shortcuts import redirect


class ChatConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None
        self.room = None
        self.user = None

    def connect(self):

        # see current user
        # print("Current user =>", self.scope["user"])

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name
        self.room = Room.objects.get(name=self.room_name)
        self.user = self.scope["user"]

        # just playing around below
        # if self.user.is_anonymous:
        #     return self.disconnect(1000)

        # accept the connection
        self.accept()

        if not self.user.is_authenticated:
            print("not authenticated!")
            # a redirect to chat page
            self.send(json.dumps({
                'type': 'forbidden_access'
            }))

        # work flow => 1) join room (by group_add), 2) send events in the room (by group_send)

        # join the room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        user_to_add = self.user.username
        joined_users = [user.username for user in self.room.online.all()]

        if user_to_add not in joined_users:
            # print("checking")
            joined_users.append(user_to_add)

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'chat_room_joined',                                     # function to invoke
                'users': joined_users,    # event              
            }
        )

        self.room.online.add(self.user)
        print("user joined!")

    def chat_room_joined(self, event):
        existing_users = event['users']

        self.send(text_data=json.dumps(
            {
                "type": "user_list", 
                "users": existing_users, 
                }))

    def disconnect(self, close_code):

        # updates in DB (for room)
        self.room.online.remove(self.user)

        # send the leave event to the room (needs to be in the room first)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_room_left',
                'remaining_users': [user.username for user in self.room.online.all()],
            }
        )

        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
  
        print("user left!")

    def chat_room_left(self, event):
        remaining_users = event['remaining_users']
        
        # updating the user_list (using the case user_list to update the online users list)
        self.send(text_data=json.dumps(
            {"type": "user_list", "users": remaining_users }))

    # Receive message from WebSocket
    def receive(self, text_data):

        # # current user
        # current_user = self.scope["user"]
        # print("current user =>", current_user)

        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                "type": "chat_message",         # function to invoke
                "message": message,             # will sent as an event
                "user_name": self.user.username # will sent as an event
            }
        )

        # saving the user message in the DB
        Message.objects.create(user=self.user, room=self.room, content=message)

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        user_name = event["user_name"]

        # Send message to WebSocket
        self.send(text_data=json.dumps(
            {"type": "new_message", "message": message, "user_name": user_name}))
