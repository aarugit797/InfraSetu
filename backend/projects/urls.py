from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectReportViewSet, IssueViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'reports', ProjectReportViewSet, basename='report')
router.register(r'issues', IssueViewSet, basename='issue')

urlpatterns = [
    path('', include(router.urls)),
]
