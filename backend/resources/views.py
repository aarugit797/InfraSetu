from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Resource, ResourceAllocation, ResourceRequest
from .serializers import ResourceSerializer, ResourceAllocationSerializer, ResourceRequestSerializer

class IsPM(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'MANAGER'

class IsContractor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CONTRACTOR'

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CONTRACTOR':
            return Resource.objects.filter(assigned_contractor=user)
        return super().get_queryset()

class ResourceAllocationViewSet(viewsets.ModelViewSet):
    queryset = ResourceAllocation.objects.all()
    serializer_class = ResourceAllocationSerializer
    permission_classes = [IsPM]

class ResourceRequestViewSet(viewsets.ModelViewSet):
    queryset = ResourceRequest.objects.all()
    serializer_class = ResourceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CONTRACTOR':
            return ResourceRequest.objects.filter(contractor=user)
        if user.role == 'MANAGER':
            return ResourceRequest.objects.all()
        return ResourceRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(contractor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsPM])
    def approve(self, request, pk=None):
        resource_request = self.get_object()
        resource_request.status = 'APPROVED'
        resource_request.pm_feedback = request.data.get('feedback', '')
        resource_request.save()
        return Response({'status': 'Request approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsPM])
    def reject(self, request, pk=None):
        resource_request = self.get_object()
        resource_request.status = 'REJECTED'
        resource_request.pm_feedback = request.data.get('feedback', '')
        resource_request.save()
        return Response({'status': 'Request rejected'})
