from rest_framework import serializers
from .models import Company, JobModel, Tag, SavedJobs


class CompanySerializer(serializers.ModelSerializer):
    owner_id =serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Company
        fields = '__all__'

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id","name","slug"]

    def create(self, validated_data):
        tag, created = Tag.objects.get_or_create(
            name=validated_data.get("name")
        )
        return tag

class JobSerializer(serializers.ModelSerializer):
    tags = TagsSerializer(many=True, read_only=True)
    class Meta:
        model = JobModel
        fields = '__all__'
        read_only_fields = ["company", "created_by", "slug"]

        



   

class SavedJobsSerializer(serializers.ModelSerializer):
    jobs = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset = JobModel.objects.all(),
        source='jobs',
        write_only=True
    )
    class Meta:
        model = SavedJobs
        fields = '__all__'