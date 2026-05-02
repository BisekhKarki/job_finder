from django.contrib import admin
from .models import Company, JobModel, Tag, SavedJobs

# Register your models here.

admin.site.register(Company)
admin.site.register(JobModel)
admin.site.register(Tag)
admin.site.register(SavedJobs)

