from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse


class Room(models.Model):
    name = models.CharField(max_length=200)
    online = models.ManyToManyField(to=User, blank=True)

    def get_online_count(self):
        return self.online.count()

    def __str__(self):
        return f'{self.name} (Online: {self.get_online_count()})'


class Message(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    room = models.ForeignKey(to=Room, on_delete=models.CASCADE)
    content = models.CharField(max_length=512)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} | {self.content} [{self.timestamp}]'