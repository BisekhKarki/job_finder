from rest_framework import serializers
from .models import Application
from accounts.serializers import UserModelSerializer
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserModelSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['applicant','job','slug', 'status','resume','cover_letter','applied_at']