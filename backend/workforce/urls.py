from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, DailyLogViewSet, WageRequestViewSet

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet)
router.register(r'logs', DailyLogViewSet)
router.register(r'wages', WageRequestViewSet, basename='wage')

urlpatterns = [
    path('', include(router.urls)),
]
