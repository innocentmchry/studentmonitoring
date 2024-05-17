from django.contrib import admin

# Register your models here.
from .models import RoomMember, Admin, FaceImage, Status, Student_Emotion, Summary, ChannelInfo

admin.site.register(RoomMember)
admin.site.register(Admin)
admin.site.register(FaceImage)
admin.site.register(Status)
admin.site.register(Student_Emotion)
admin.site.register(Summary)
admin.site.register(ChannelInfo)