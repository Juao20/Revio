from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/study/', include('apps.study.urls')),
]