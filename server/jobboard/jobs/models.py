from django.db import models
from accounts.models import UserModel
from django.conf import settings
from django.utils.text import slugify
import uuid
from django.core.exceptions import ValidationError

# Create your models here.
class Company(models.Model):
    owner_id = models.OneToOneField(UserModel, on_delete=models.CASCADE,related_name='company' )
    company_name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, null=True, blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="uploads/company/", blank=True, null= False)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.company_name)

        while Company.objects.filter(slug=self.slug).exists():
            self.slug = f"{slugify(self.company_name)}-{uuid.uuid4().hex[:6]}"

        super().save(*args, **kwargs)


    def __str__(self):
        return self.company_name
    

    
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        while Tag.objects.filter(slug=self.slug).exists():
            self.slug = f"{slugify(self.name)}-{uuid.uuid4().hex[:6]}"

        super().save(*args, **kwargs)



class JobModel(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        REMOTE = 'remote', 'Remote'
        INTERNSHIP = 'internship', 'Internship'

    class ExperienceLevel(models.TextChoices):
        ENTRY = 'entry', 'Entry Level'
        MID = 'mid', 'Mid Level'
        SENIOR = 'senior', 'Senior Level'

    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, null=True, blank=True)
    description = models.TextField()
    requirements = models.TextField()
    job_type = models.CharField(choices=JobType.choices, max_length=20)
    experience_level = models.CharField(choices=ExperienceLevel.choices, max_length=20)
    location = models.CharField(max_length=200, blank=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name='created_jobs', blank=True, null=True)

    def __str__(self):
        return f"{self.title} at {self.company.company_name}"
    
    def save(self,*args,**kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_id = str(uuid.uuid4().hex[:8])
            self.slug = f"{base_slug}-{unique_id}"
        super().save(*args,**kwargs)

    def clean(self):
        if self.salary_min and self.salary_max:
            if self.salary_min > self.salary_max:
                raise ValidationError("salary_min cannot be greater than salary_max")
            
    class Meta:
        indexes = [
            models.Index(fields=["job_type"]),
            models.Index(fields=["experience_level"]),
            models.Index(fields=["is_active"])
        ]



class SavedJobs(models.Model):
    jobs = models.ForeignKey(JobModel, on_delete=models.CASCADE, null=False, blank=False, related_name="saved_by")
    saved_by = models.ForeignKey(UserModel, on_delete=models.CASCADE, null=False, blank=False, related_name="saved_jobs")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('saved_by','jobs')

