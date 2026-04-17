from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceAllocationViewSet, ResourceRequestViewSet

router = DefaultRouter()
router.register(r'list', ResourceViewSet, basename='resource')
router.register(r'allocations', ResourceAllocationViewSet, basename='allocation')
router.register(r'requests', ResourceRequestViewSet, basename='request')

urlpatterns = [
    path('', include(router.urls)),
]
