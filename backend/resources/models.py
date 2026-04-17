from django.db import models
from django.conf import settings
from projects.models import Project

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('WORKER', 'Worker'),
        ('EQUIPMENT', 'Equipment'),
        ('MATERIAL', 'Material'),
    )
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('IN-USE', 'In Use'),
        ('DAMAGED', 'Damaged'),
        ('MAINTENANCE', 'Maintenance'),
    )
    
    type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Quantity for materials or count for workers/equipment")
    unit = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., kg, bags, pieces")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    assigned_project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    assigned_contractor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_resources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class ResourceAllocation(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='allocations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='allocations')
    contractor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_allocations')
    quantity_allocated = models.DecimalField(max_digits=10, decimal_places=2)
    allocated_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.quantity_allocated} of {self.resource.name} to {self.project.name}"

class ResourceRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='resource_requests')
    contractor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    resource_type = models.CharField(max_length=20, choices=Resource.RESOURCE_TYPES)
    resource_name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    pm_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request for {self.resource_name} by {self.contractor.name}"
