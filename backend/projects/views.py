from rest_framework import viewsets, permissions
from .models import Project, ProjectReport, Issue
from .serializers import ProjectSerializer, ProjectReportSerializer, IssueSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INVESTOR':
            return user.invested_projects.all()
        return super().get_queryset()

class ProjectReportViewSet(viewsets.ModelViewSet):
    queryset = ProjectReport.objects.all()
    serializer_class = ProjectReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
