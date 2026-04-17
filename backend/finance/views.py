from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Invoice, PaymentRequest
from .serializers import InvoiceSerializer, PaymentRequestSerializer

class PaymentRequestViewSet(viewsets.ModelViewSet):
    queryset = PaymentRequest.objects.all()
    serializer_class = PaymentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CONTRACTOR':
            return PaymentRequest.objects.filter(contractor=user)
        if user.role in ['MANAGER', 'INVESTOR', 'GOVT']:
            return PaymentRequest.objects.all()
        return PaymentRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(contractor=self.request.user)

    @action(detail=True, methods=['post'])
    def review_pm(self, request, pk=None):
        if request.user.role != 'MANAGER':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        payment = self.get_object()
        payment.status = 'PENDING_OWNER'
        payment.pm_feedback = request.data.get('feedback', '')
        payment.save()
        return Response({'status': 'Sent to Owner for approval'})

    @action(detail=True, methods=['post'])
    def approve_owner(self, request, pk=None):
        if request.user.role != 'INVESTOR':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        payment = self.get_object()
        payment.status = 'APPROVED'
        payment.owner_feedback = request.data.get('feedback', '')
        payment.save()
        return Response({'status': 'Approved by Owner'})

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
