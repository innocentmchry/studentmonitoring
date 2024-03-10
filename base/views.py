from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json
import base64
import re
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO
from django.core.files import File
from .forms import ImageForm
from io import StringIO
from django.shortcuts import get_object_or_404

from tensorflow.keras.preprocessing import image
from keras.models import model_from_json
import numpy as np
import matplotlib.pyplot as plt
import os
import cv2
from django.db.models import Sum
from django.http import HttpResponse

import csv



from django.core.files.uploadedfile import InMemoryUploadedFile

from .models import RoomMember, Admin, FaceImage, Status, Student_Emotion, Summary

from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def getToken(request):
    appId = '67cfc50c50834b7293ed8598993d29bd'
    appCertificate = '23f91830ba4e450784e9164c118e9bb0'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = int(time.time())
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1
    
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token, 'uid':uid}, safe=False)

def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')


# we gonna send a post request to this backend below
# we gonna get a post request from front end

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    
    # check if data['email'] is contained in a database named Admin which has column named email, if so assign the role as admin, other wise asign as participant

    print(data)
    email = data['email']
    
    try:
        admin = Admin.objects.get(email=email)
        role = "admin"
    except Admin.DoesNotExist:
        role = "participant"
    
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name'],
        role=role
    )
    return JsonResponse({'name':data['name'], 'role':role}, safe=False)


def getMember(request):
    # getting the parameters from the get request
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    
    # quering the member
    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
        
    )
    
    # returning back the name    
    name = member.name
    role = member.role
    return JsonResponse({'name':name, 'role':role}, safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name'],
    )
    member.delete()
    return JsonResponse('Member was deleted', safe=False)


@csrf_exempt
def predictor(request):
    # name = request.POST['name']
    uid = request.POST['uid']
    
    print(f"uid is {uid}")
    blob = request.FILES['image'].read()
    thumb = Image.open(BytesIO(blob))
    rgb_im = thumb.convert('RGB')
    

    
    #### This part is saving the image temporarily into a folder
    
    # filename = name + ".jpg"
    # tempfile = rgb_im
    # tempfile_io = BytesIO()
    # tempfile.save(tempfile_io, format='JPEG')
    # image_file = InMemoryUploadedFile(tempfile_io, None, filename, 'image/jpeg', rgb_im.tell, None)
    # form = FaceImage(name=name, image=image_file)
    # form.save()   
    # image_path = form.image.path
    # img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    ####
    
    img = cv2.cvtColor(np.asarray(rgb_im), cv2.COLOR_RGB2GRAY)

    face_cascade = cv2.CascadeClassifier('./savedModels/haarcascade_frontalface_default.xml') 

    faces = face_cascade.detectMultiScale(img, 1.3, 4)
    print('Number of detected faces:', len(faces))
            
    # fix more than one faces later when you get time
    # if len(faces) > 0:
    #     for i, (x, y, w, h) in enumerate(faces):
    #         face = img[y:y + h, x:x + w]
    
    if len(faces) == 0:
        # os.remove(image_path)
        # form.delete()
        return JsonResponse({})
    
    
    x, y, w, h = faces[0]
    face = img[y:y + h, x:x + w]
    face_visualize = Image.fromarray(face)
    # face_visualize.show()
         
    face = cv2.resize(face, (120, 120))
           
    img_array = image.img_to_array(face)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
            
    json_file = open("./savedModels/affect_model.json", "r")
    loaded_model_json = json_file.read()
    json_file.close()

    loaded_model_v = model_from_json(loaded_model_json)
    loaded_model_a = model_from_json(loaded_model_json)

    loaded_model_v.load_weights("./savedModels/valence-weights-improvement-137-0.23.h5")
    loaded_model_a.load_weights("./savedModels/arousal-weights-improvement-95-0.17.h5")

    loaded_model_v.compile(loss='mean_squared_error', optimizer='sgd')
    loaded_model_a.compile(loss='mean_squared_error', optimizer='sgd')

    prediction_v = loaded_model_v.predict(img_array)
    prediction_a = loaded_model_a.predict(img_array)
    
    str_prediction_v = str(prediction_v[0][0])
    str_prediction_a = str(prediction_a[0][0])

    classification = f"Valence: {str_prediction_v}, Arousal: {str_prediction_a}"
    print(classification)
    
    emotion = ""
    
    predicted_valence = prediction_v[0][0]
    predicted_arousal = prediction_a[0][0]
    
    if -0.138 <= predicted_valence <= 0.138 and -0.117 <= predicted_arousal <= 0.117:
        emotion = "neutral"
    else:            
        if predicted_valence > 0:
            if predicted_arousal > 0: 
                emotion = "curious"
            else:
                emotion = "hopefullness"
        else:
            if predicted_arousal > 0:
                emotion = "confusion"
            else:
                emotion = "boredom"
    
    student_emotion, created = Student_Emotion.objects.get_or_create(uid=uid)

    # write a query to get name 
   
    room_member = get_object_or_404(RoomMember, uid=uid)
    name = room_member.name
    student_emotion.name = name
    
    if emotion == 'curious':
        student_emotion.curious += 1
    elif emotion == 'confusion':
        student_emotion.confusion += 1
    elif emotion == 'boredom':
        student_emotion.boredom += 1
    elif emotion == 'hopefullness':
        student_emotion.hopefullness += 1
    elif emotion == 'neutral':
        student_emotion.neutral += 1
    else:
        pass

    student_emotion.save()
    
    
    st = Status(uid=uid, name=name, valence=predicted_valence, arousal=predicted_arousal, predicted_emotion=emotion)
    st.save()
    
    # os.remove(image_path)
    # form.delete()

    return JsonResponse({'result':classification}, safe=False)

@csrf_exempt
def getEmotions(request):
    print("Get Emotions is Accessed")
    queryset = Student_Emotion.objects.all()[:50]
    print(queryset)
    return JsonResponse({"users":list(queryset.values())})

def summary(request):
    summaries = Summary.objects.all()
    return render(request, 'base/summary.html', {'summaries': summaries})


def calculateSummary(request): 
    if Summary.objects.count() == 0:
        student_emotions = Student_Emotion.objects.all()
        summary_objects = []
        
        for student_emotion in student_emotions:
            total_emotions = student_emotion.curious + student_emotion.confusion + student_emotion.boredom + student_emotion.hopefullness + student_emotion.neutral
            curious_percentage = (student_emotion.curious / total_emotions) * 100
            confusion_percentage = (student_emotion.confusion / total_emotions) * 100
            boredom_percentage = (student_emotion.boredom / total_emotions) * 100
            hopefullness_percentage = (student_emotion.hopefullness / total_emotions) * 100
            neutral_percentage = (student_emotion.neutral / total_emotions) * 100
            summary_object = Summary(
                name=student_emotion.name,
                curious=round(curious_percentage, 2),
                confusion=round(confusion_percentage, 2),
                boredom=round(boredom_percentage, 2),
                hopefullness=round(hopefullness_percentage, 2),
                neutral=round(neutral_percentage, 2)
            )
            summary_objects.append(summary_object)

        Summary.objects.bulk_create(summary_objects)

    return JsonResponse({})

def loadSummary(request):     
    return render(request, 'base/summary.html')

def calculateFirstComponent(request):
    context = {'val': 0}
    if Summary.objects.count() != 0:
        val = 1    
        totals = Summary.objects.aggregate(
            total_curious=Sum('curious'),
            total_confusion=Sum('confusion'),
            total_boredom=Sum('boredom'),
            total_hopefullness=Sum('hopefullness'),
            total_neutral=Sum('neutral'),
        )
        
        total_records = Summary.objects.count()
        
        labels = ['Curious', 'Confused', 'Bored','Hopefull','Neutral']
        percentage = [totals['total_curious'] / total_records, totals['total_confusion'] / total_records, totals['total_boredom'] / total_records, totals['total_hopefullness'] / total_records, totals['total_neutral'] / total_records]
        context = {'labels': labels, 'data': percentage, 'val': val}
    
    return JsonResponse(context)


def calculateSecondComponent(request):        
    curious_ranking = list(Summary.objects.all().order_by('-curious').values_list('name', flat=True))
    confused_ranking = list(Summary.objects.all().order_by('-confusion').values_list('name', flat=True))
    bored_ranking = list(Summary.objects.all().order_by('-boredom').values_list('name', flat=True))
    hopefull_ranking = list(Summary.objects.all().order_by('-hopefullness').values_list('name', flat=True))
    neutral_ranking = list(Summary.objects.all().order_by('-neutral').values_list('name', flat=True))
    
    # ranking_length = len(curious_ranking)

    # # for rank, (curious, confused, bored, hopefull, neutral) in enumerate(zip(curious_ranking, confused_ranking, bored_ranking, hopefull_ranking, neutral_ranking), start=1):
    # #     ranking_instance = Ranking(
    # #         rank=rank,
    # #         curious_person=curious,
    # #         confused_person=confused,
    # #         bored_person=bored,
    # #         hopefull_person=hopefull,
    # #         neutral_person=neutral
    # #     )
    # #     ranking_instance.save()
    # #     if rank == ranking_length:
    # #         break
    
    # ranking_data = []

    # for rank, (curious, confused, bored, hopefull, neutral) in enumerate(zip(curious_ranking, confused_ranking, bored_ranking, hopefull_ranking, neutral_ranking), start=1):
    #     ranking_data.append({
    #         'rank': rank,
    #         'curious_person': curious,
    #         'confused_person': confused,
    #         'bored_person': bored,
    #         'hopefull_person': hopefull,
    #         'neutral_person': neutral
    #     })
    #     if rank == ranking_length:
    #         break

    return JsonResponse({'curious_person':curious_ranking, 'confused_person': confused_ranking, 'bored_person': bored_ranking, 'hopefull_person': hopefull_ranking, 'neutral_person': neutral_ranking})

def calculateThirdComponent(request):
    student_emotions = Student_Emotion.objects.all()
    
    rows_list = []
    
    for student_emotion in student_emotions:
        row_list = [
            student_emotion.name,
            student_emotion.uid,
            student_emotion.curious,
            student_emotion.confusion,
            student_emotion.boredom,
            student_emotion.hopefullness,
            student_emotion.neutral,
        ]
        rows_list.append(row_list)
    
    
    status = Status.objects.all()
    dict = {}
    for statu in status:
        values = []
        if statu.uid not in dict.keys():
            values = [{'x': statu.valence, 'y': statu.arousal}]
            dict[statu.uid] = values
        else:
            values = dict[statu.uid]
            values.append({'x': statu.valence, 'y': statu.arousal})
            dict[statu.uid] = values
    
    
    
        
    return JsonResponse({'rows_list': rows_list, 'data': dict})

def calculateFourthComponent(request):
    status = Status.objects.all()
    
    dict = {}
    for statu in status:
        emotion_values = {
            'neutral' : 0,
            'hopefullness' : 20,
            'curious' : 40,
            'confusion' : -20,
            'boredom' : -40
        }
        values = []
        if statu.name not in dict.keys():
            values = [{str(statu.time_stamp)[:8] : emotion_values[statu.predicted_emotion]}]
            dict[statu.name] = values
        else:
            values = dict[statu.name]
            values.append({str(statu.time_stamp)[:8] : emotion_values[statu.predicted_emotion]})
            dict[statu.name] = values
    
            
    return JsonResponse({'data' : dict})

def downloadCsvFile(request):
    status = Status.objects.all()
    response = HttpResponse('text/csv')
    response['Content-Disposition'] = 'attachment; filename=statusdata.csv'
    writer = csv.writer(response)
    writer.writerow(['ID', 'UID', 'Name', 'Time Stamp', 'Valence', 'Arousal', 'Predicted Emotion'])
    statu = status.values_list('id','uid', 'name', 'time_stamp' , 'valence', 'arousal', 'predicted_emotion')
    for row in statu:
        formatted_time_stamp = str(row[3])[:8]
        modified_row = row[:3] + (formatted_time_stamp,) + row[4:]
        writer.writerow(modified_row)
    return response

def downloadCsvFile2(request):
    student_emotions = Student_Emotion.objects.all()
    response = HttpResponse('text/csv')
    response['Content-Disposition'] = 'attachment; filename=studentemotiondata.csv'
    writer = csv.writer(response)
    writer.writerow(['ID', 'UID','Name', 'Curious' , 'Confusion', 'Boredom', 'Hopefullness', 'Neutral'])
    student_emotion = student_emotions.values_list('id','uid', 'name', 'curious' , 'confusion', 'boredom', 'hopefullness', 'neutral')
    for row in student_emotion:
        writer.writerow(row)
    return response

def checkAdminClearData(request):
    data = json.loads(request.body)
    
    email = data['email']
    deleted = 0
    try:
        admin = Admin.objects.get(email=email)
        role = "admin"
    except Admin.DoesNotExist:
        role = "participant"
    
    if role == 'admin':
        Summary.objects.all().delete()
        Status.objects.all().delete()
        Student_Emotion.objects.all().delete()
        deleted = 1
    
    return JsonResponse({'deleted':deleted})
    