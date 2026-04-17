from django.db import models
from django.conf import settings
from projects.models import Project

class Invoice(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=(('Paid', 'Paid'), ('Pending', 'Pending')))
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

class PaymentRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING_PM', 'Pending PM Review'),
        ('PENDING_OWNER', 'Pending Owner Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PAID', 'Paid'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='payment_requests')
    contractor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_requests')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_PM')
    pm_feedback = models.TextField(blank=True, null=True)
    owner_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment Req: {self.amount} - {self.contractor.name}"
