"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from healthcheck import *
from django.urls import path, include
from .views import *


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HealthCheck.as_view()),
    path('v1/', include('app.urls')),
    path('voc/scale/',RedirectURL.as_view()),
    path('voc/report/',ReportRedirectURL.as_view()),
    path('voc/login/', LoginsRedirectURL.as_view()),
    path('llx/login/', LoginsRedirectURLForLLx.as_view()),
    path('llx/report/', ReportRedirectURLForLLx.as_view()),
    path('llx/scale/', RedirectURLForLLx.as_view())
]
