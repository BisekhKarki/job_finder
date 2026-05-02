from django.db import models
from django.conf import settings
from jobs.models import JobModel
from accounts.models import UserModel
from django.utils.text import slugify
import uuid

class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED    = 'applied',   'Applied'
        REVIEWING  = 'reviewing', 'Reviewing'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        REJECTED   = 'rejected',  'Rejected'
        HIRED      = 'hired',     'Hired'
        WITHDRAWN = 'withdrawn', "Withdrawn"
        INTERVIEWING = "interviewing", "Interviewing"

    job = models.ForeignKey(JobModel,on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to='uploads/resumes/',blank=False, null= False)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(choices=Status.choices, max_length=20, default=Status.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        unique_together = ('job','applicant')

    def __str__(self):
        return f"{self.applicant.username} -> {self.job.title}"
    
    def save(self, *args,**kwargs):
        if not self.slug:
            base = slugify(self.applicant.username)
            self.slug = f"{base}-{uuid.uuid4().hex[:6]}"
        super().save(*args, **kwargs)


    

