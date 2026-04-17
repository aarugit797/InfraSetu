from rest_framework import viewsets, permissions
from django.db import models
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'WORKER':
            return Task.objects.filter(assigned_to=user)
        if user.role == 'CONTRACTOR':
            # See tasks assigned to them + subtasks they assigned to workers
            return Task.objects.filter(models.Q(assigned_to=user) | models.Q(assigned_by=user))
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
