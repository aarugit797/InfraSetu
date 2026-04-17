from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Attendance, DailyLog, WageRequest
from .serializers import AttendanceSerializer, DailyLogSerializer, WageRequestSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

class DailyLogViewSet(viewsets.ModelViewSet):
    queryset = DailyLog.objects.all()
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class WageRequestViewSet(viewsets.ModelViewSet):
    queryset = WageRequest.objects.all()
    serializer_class = WageRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'WORKER':
            return WageRequest.objects.filter(worker=user)
        if user.role == 'CONTRACTOR':
            return WageRequest.objects.all() # In a real app, filter by contractor's workers
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(worker=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'CONTRACTOR':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        wage_req = self.get_object()
        wage_req.status = 'APPROVED'
        wage_req.contractor_feedback = request.data.get('feedback', '')
        wage_req.save()
        return Response({'status': 'Approved'})
