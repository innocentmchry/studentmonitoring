from django.db import models
from django.utils import timezone
import pytz

# Create your models here.

class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=1000)
    room_name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    screensharing = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Admin(models.Model):
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.email
    
class FaceImage(models.Model):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='images/')
    
    def __str__(self): 
	    return self.name

class Status(models.Model):
    uid = models.CharField(max_length=1000)
    name = models.CharField(max_length=100)
    time_stamp = models.TimeField(default=timezone.now)
    valence = models.FloatField(default=0.0)
    arousal = models.FloatField(default=0.0)
    predicted_emotion = models.CharField(max_length=100)
    
    def save(self, *args, **kwargs):
        ist = pytz.timezone('Asia/Kolkata')
        self.time_stamp = timezone.now().astimezone(ist)
        super().save(*args, **kwargs)
        
    def __str__(self): 
	    return self.uid
 
class Student_Emotion(models.Model):
    uid = models.CharField(max_length=1000)
    name = models.CharField(max_length=100)
    curious = models.IntegerField(default=0)
    confusion = models.IntegerField(default=0)
    boredom = models.IntegerField(default=0)
    hopefullness = models.IntegerField(default=0)
    neutral = models.IntegerField(default=0)
    
    def __str__(self):
        return self.uid
    
class Summary(models.Model):
    name = models.CharField(max_length=100)
    curious = models.FloatField(default=0.0)
    confusion = models.FloatField(default=0.0)
    boredom = models.FloatField(default=0.0)
    hopefullness = models.FloatField(default=0.0)
    neutral = models.FloatField(default=0.0)
    
    def __str__(self):
        return self.name

    
