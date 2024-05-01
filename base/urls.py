from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('room/', views.room),
    
    path('get_token/', views.getToken),
    
    path('create_member/', views.createMember),
    path('get_member/', views.getMember),
    path('delete_member/', views.deleteMember),
    path('predict_member/', views.predictor),
    path('get_emotions/', views.getEmotions),
    path('calculate_summary/', views.calculateSummary),
    path('summary/', views.loadSummary),
    path('calculate_first_component/', views.calculateFirstComponent),
    path('calculate_second_component/', views.calculateSecondComponent),
    path('calculate_third_component/', views.calculateThirdComponent),
    path('calculate_fourth_component/', views.calculateFourthComponent),
    path('download_csv_file/', views.downloadCsvFile),
    path('download_csv_file2/', views.downloadCsvFile2),
    path('check_admin_clear_data/', views.checkAdminClearData),
    path('check_admin_clear_data_room/', views.checkAdminClearDataRoom),
    path('check_admin_recalculate_data/', views.recalculate),
    path('check_empty/', views.checkEmpty),
    path('toggle_screenshare/', views.toggleScreenShare)
]
