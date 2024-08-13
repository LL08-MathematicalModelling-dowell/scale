from django.urls import path
from .views import *

urlpatterns = [
    path('', APIHealthServices.as_view())
]