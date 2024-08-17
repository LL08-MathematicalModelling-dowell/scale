from django.urls import path
from .views import UserManagement, ScaleManagement,healthCheck, ScaleCreateAPI

urlpatterns = [
    path("", healthCheck.as_view()),
    path("voc/user-management/",UserManagement.as_view()),
    path("voc/scale-management/",ScaleManagement.as_view()),
    path("scale/scale-services/",ScaleCreateAPI.as_view())

]