from rest_framework import serializers
from .models import Invoice, PaymentRequest

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class PaymentRequestSerializer(serializers.ModelSerializer):
    contractor_name = serializers.ReadOnlyField(source='contractor.name')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = PaymentRequest
        fields = '__all__'
