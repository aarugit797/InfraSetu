from rest_framework import serializers
from .models import Attendance, DailyLog, WageRequest

class WageRequestSerializer(serializers.ModelSerializer):
    worker_name = serializers.ReadOnlyField(source='worker.name')

    class Meta:
        model = WageRequest
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = '__all__'
