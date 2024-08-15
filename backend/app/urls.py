from django.urls import path
from .views import UserManagement, ScaleManagement,healthCheck

urlpatterns = [
    path("", healthCheck.as_view()),
    path("voc/user-management/",UserManagement.as_view()),
    path("voc/scale-management/",ScaleManagement.as_view())

]