from django.db import models

from account.models import User


class Message(models.Model):
    body = models.TextField()
    sent_by = models.CharField(max_length=250)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ('created_at',)
    
    def __str__(self):
        return f'{self.sent_by}'

class Room(models.Model):
    WAITING = 'waiting'
    ACTIVE = 'active'
    CLOSED = 'closed'

    CHOICES_STATUS = (
        (WAITING, 'Waiting'),
        (ACTIVE, 'Active'),
        (CLOSED, 'Closed'),
    )

    uuid = models.CharField(max_length=250)
    client = models.CharField(max_length=250)
    agent = models.ForeignKey(User, related_name = 'rooms', on_delete=models.SET_NULL, blank=True, null=True)
    messages = models.ManyToManyField(Message, blank=True)
    url = models.CharField(max_length=250, blank=True, null=True)
    status = models.CharField(max_length=20, default='waiting', choices= CHOICES_STATUS)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.client} - {self.uuid} - {self.status}'