from rest_framework import serializers
from .models import Trip

class TripSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Trip
        fields = '__all__'
