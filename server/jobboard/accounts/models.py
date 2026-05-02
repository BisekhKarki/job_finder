from django.db import models

from django.contrib.auth.models import AbstractUser


class UserModel(AbstractUser):

    # username 
    class ChooseRoles(models.TextChoices):
        EMPLOYER = 'employer', 'Employer'
        APPLICANT = 'applicant', 'Applicant'

    email = models.EmailField(unique=True)
    role = models.CharField(choices = ChooseRoles.choices, max_length=20, default=ChooseRoles.APPLICANT)
    avatar = models.ImageField(upload_to="uploads/user/", blank=True, null= True)
    bio = models.TextField(blank=True)
    address = models.CharField(max_length=50, blank=True, null=True)
    account_status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=10, blank=True, null=True)

    def is_employer(self):
        return self.role == self.ChooseRoles.EMPLOYER
    
    def is_applicant(self):
        return self.role == self.ChooseRoles.APPLICANT