from django.urls import path

from . import views


urlpatterns = [
    path("", views.home_page, name="home"),
    path("chat/", views.index, name="index"),
    path("chat/<str:room_name>/", views.room, name="room"),
]