from rest_framework import viewsets, permissions
from .models import Trip
from .serializers import TripSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'ENGINEER']:
            return Trip.objects.all()
        # In a real app, restrict based on project assignment
        return Trip.objects.all()
