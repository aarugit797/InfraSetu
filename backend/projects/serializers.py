from rest_framework import serializers
from .models import Project, ProjectReport, Issue

class ProjectSerializer(serializers.ModelSerializer):
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'location', 'status', 'budget', 'progress', 'startDate', 'endDate', 'created_at', 'investors')

class ProjectReportSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.name')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = ProjectReport
        fields = '__all__'

class IssueSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.name')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Issue
        fields = '__all__'
