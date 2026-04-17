from django.db import models
from projects.models import Project

class Trip(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    vehicle_number = models.CharField(max_length=20)
    material_type = models.CharField(max_length=100)
    tonnage = models.FloatField()
    driver_name = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip {self.id} - {self.vehicle_number}"
