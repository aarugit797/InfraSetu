from rest_framework import serializers
from .models import Resource, ResourceAllocation, ResourceRequest
from accounts.serializers import UserSerializer

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class ResourceAllocationSerializer(serializers.ModelSerializer):
    resource_details = ResourceSerializer(source='resource', read_only=True)
    contractor_details = UserSerializer(source='contractor', read_only=True)
    
    class Meta:
        model = ResourceAllocation
        fields = '__all__'

class ResourceRequestSerializer(serializers.ModelSerializer):
    contractor_name = serializers.ReadOnlyField(source='contractor.name')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = ResourceRequest
        fields = '__all__'
