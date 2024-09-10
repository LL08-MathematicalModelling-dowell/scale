from django.urls import path
from .views import *

urlpatterns = [
    path("", healthCheck.as_view()),
    path("voc/user-management/",UserManagement.as_view()),
    path("voc/scale-management/",ScaleManagement.as_view()),
    path('create-scale/', ScaleCreationView.as_view(), name='scale_creation_class')

]