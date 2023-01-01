from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from .models import Room, Message


def home_page(request):
    return render(request, 'homepage.html')


def index(request):
    return render(request, "index.html", context={"rooms": Room.objects.all()})


def room(request, room_name):
    # print("\nchecking =>", request.user.is_authenticated)
    if request.user.is_authenticated:
        chat_room, created = Room.objects.get_or_create(name=room_name)
        earlier_room_messages = Message.objects.filter(room=chat_room.id)
        # print("\nearlier_room_messages ==>", earlier_room_messages)

        return render(
            request,
            "room.html",
            {"room_name": room_name, "earlier_room_messages": earlier_room_messages}
        )
    else:
        raise PermissionDenied
