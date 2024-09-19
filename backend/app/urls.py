from django.urls import path
from .views import *
from ._views import *

urlpatterns = [
    path("", healthCheck.as_view()),
    path("voc/user-management/",UserManagement.as_view()),
    path("voc/scale-management/",ScaleManagement.as_view()),
    path('scale-services/', ScaleCreationView.as_view(), name='scale_creation_class'),
    
    # --------- OLD ENDPOINTS --------------

    path('create-scale/', ScaleCreateAPI.as_view(), name='create-scale-1'),
    path('create-response/', csrf_exempt(create_scale_response), name='create-response-1'),
    path('get-response/', csrf_exempt(get_scale_response), name='get-response'),
    path('learning-index-report/', csrf_exempt(learning_index_report), name='learning-index-report'),
    path('get-report/',ScaleReport.as_view(), name='scale-report')
]