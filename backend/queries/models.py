from django.db import models

# Create your models here.

class Tweet(models.Model):
    text = models.TextField()
    time = models.DateTimeField()
    source = models.IntegerField()
    
    def __str__(self):
        return "{text}, {time}, {source}".format(text=self.text, time=self.time, source=self.source)