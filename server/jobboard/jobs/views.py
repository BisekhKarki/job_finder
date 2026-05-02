from django.shortcuts import render
from rest_framework.decorators import permission_classes, api_view
from rest_framework import status
from rest_framework.response import Response
from .models import Company, JobModel, Tag, SavedJobs
from .serializers import CompanySerializer, JobSerializer, TagsSerializer, SavedJobsSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated, BasePermission


class IsEmployeeUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and 
            request.user.is_employer()
        )
    

class IsApplicantUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and 
            request.user.is_applicant()
        )
    
class IsJobOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.created_by and request.user.is_authenticated


@api_view(['GET'])
def get_all_jobs(request):
    jobs = JobModel.objects.all()
    serializer = JobSerializer(jobs, many=True)
    if jobs is None:
        return Response({'message':'No jobs found'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'jobs':serializer.data}, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_jobs_by_slug(request, slug):
    jobs = JobModel.objects.get(slug=slug)
    serializer = JobSerializer(jobs)
    if jobs is None:
        return Response({'message':'No jobs found'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'jobs':serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsEmployeeUser])
def post_jobs(request):
    jobs = request.data
    # print(jobs)
    serializer = JobSerializer(data=jobs)
    if serializer.is_valid():
        try:
            company = request.user.company
        except:
            return Response(
                {"error": "Company not found for this user"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(created_by=request.user, company = company)
        # print(serializer.data)
        return Response({ 'job':serializer.data  },status=status.HTTP_201_CREATED)
    return Response({'errors':serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_my_jobs(request):
    jobs = JobModel.objects.filter(created_by = request.user)
    if not jobs.exists():
        return Response({'message':'No jobs has been posted'}, status=status.HTTP_404_NOT_FOUND)
    serializer = JobSerializer(jobs).data
    return Response({'jobs': serializer},status=status.HTTP_200_OK)



@api_view(["PUT","PATCH","DELETE"])
@permission_classes([IsAuthenticated])
def update_or_delete_jobs(request,slug):
    try:
        job = JobModel.objects.get(slug=slug)
    except JobModel.DoesNotExist:
        return Response({ 'error':"No job found."  },status=status.HTTP_404_NOT_FOUND)
    if job.created_by != request.user:
        return Response({'error': "You are not allowed to edit this job."}, status=status.HTTP_403_FORBIDDEN)
    if request.method  in ["PATCH","PUT"]:
        if "tags" in request.data:
            job.tags.set(request.data['tags'])
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({ 'job':serializer.data  },status=status.HTTP_200_OK)
        return Response({'errors':serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        job.delete()
        return Response({ 'message':"Job deleted successfully"  },status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
@permission_classes([IsEmployeeUser])
def get_my_jobs(request):
    jobs = JobModel.objects.filter(created_by = request.user)
    if not jobs.exists():
        return Response({ 'error':"No job found."  },status=status.HTTP_404_NOT_FOUND)
    serializer = JobSerializer(jobs, many=True)
    return Response({ 'job':serializer.data  },status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsEmployeeUser])
def jobToggleStatusView(request,slug):
    try:
        jobs = JobModel.objects.get(slug=slug, created_by=request.user)
    except JobModel.DoesNotExist:
        return Response({ 'error':"No job found."  },status=status.HTTP_404_NOT_FOUND)
    jobs.is_active = not jobs.is_active
    jobs.save()
    seralizer = JobSerializer(jobs)
    return Response({ 'message':"Job status changed", "is_active": jobs.is_active, 'job': seralizer.data },status=status.HTTP_200_OK)


@api_view(['GET'])
def get_all_companies(request):
    company = Company.objects.filter(is_active=True)
    serializer = CompanySerializer(company, many=True)
    if company is None:
        return Response({'message':'No company found'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'companies':serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_company(request):
    user = request.user
    try:
        company = Company.objects.get(owner_id = user)
    except:
        return Response({'message':'No company found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = CompanySerializer(company)
    return Response({'company':serializer.data}, status=status.HTTP_200_OK)
    


@api_view(['GET'])
def get_company_by_slug(request, slug):
    company = Company.objects.get(slug=slug)
    serializer = CompanySerializer(company)
    if company is None:
        return Response({'message':'No company found'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'company':serializer.data}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([IsEmployeeUser])
def post_company(request):

    if Company.objects.filter(owner_id=request.user).exists():
        return Response(
            {"error": "Company already exists for this user"},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CompanySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(owner_id=request.user)
        return Response(
            {"company": serializer.data},
            status=status.HTTP_201_CREATED
        )

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT","PATCH","DELETE"])
@permission_classes([IsAuthenticated])
def update_or_delete_company(request,slug):
    try:
        company = Company.objects.get(slug=slug)
    except Company.DoesNotExist:
        return Response({ 'error':"No company found."  },status=status.HTTP_404_NOT_FOUND)
    if company.owner_id != request.user:
        return Response({'error': "You are not allowed to edit this company."}, status=status.HTTP_403_FORBIDDEN)
    if request.method in ["PUT","PATCH"]:
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(owner_id=request.user)
            return Response({ 'company':serializer.data  },status=status.HTTP_200_OK)
        return Response({'errors':serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        company.delete()
        return Response({ 'message':"Company deleted successfully"  },status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
def tagsView(request):
    try:
        tags = Tag.objects.all()
        print(tags)
    except Tag.DoesNotExist:
        return Response({ 'error':"No tags found."  },status=status.HTTP_404_NOT_FOUND)
    serializer = TagsSerializer(tags, many=True)
    return Response({ 'tags': serializer.data },status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsEmployeeUser])
def add_tags(request):
    serializer = TagsSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({'tags': serializer.data}, status=status.HTTP_201_CREATED)
    print(serializer.errors)

    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsEmployeeUser])
def delete_tags(request, slug):
    try:
        tags = Tag.objects.get(slug=slug)
    except Tag.DoesNotExist:
        return Response({ 'error':"No tags found."  },status=status.HTTP_404_NOT_FOUND)
    tags.delete()
    return Response({ 'message': "Tag Deleted successfully"},status=status.HTTP_201_CREATED)




# For application saving
@api_view(['POST'])
@permission_classes([IsApplicantUser])
def save_jobs(request,slug):
    try:
        job = JobModel.objects.get(slug=slug)
    except JobModel.DoesNotExist:
        return Response(
            {"error": "Job not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    existing_saved_job = SavedJobs.objects.filter(jobs=job, saved_by=request.user).first()
    if existing_saved_job:
        existing_saved_job.delete()
        return Response({'message':"job removed from favourites"}, status=status.HTTP_204_NO_CONTENT)
    
    serializer = SavedJobsSerializer(data={
        "jobs": job,
        "job_id": job.id,
        "saved_by": request.user.id
    })
    # print(serializer)
    
    if serializer.is_valid():
        serializer.save()
        # print(serializer.data)
        return Response({ 'saved job': serializer.data },status=status.HTTP_200_OK)
        
    return Response({'errors':serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsApplicantUser])
def get_all_saved_jobs(request):
    saved_jobs = SavedJobs.objects.filter(saved_by=request.user)
    # if not saved_jobs.exists():
    #     return Response({'errors':"No jobs saved"}, status=status.HTTP_404_NOT_FOUND)
    serializer = SavedJobsSerializer(saved_jobs, many=True)
    return Response({ 'saved_job': serializer.data },status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsApplicantUser])
def get_current_job_saved(request,id):
    
    saved_jobs = SavedJobs.objects.filter(jobs=id,saved_by=request.user)
    if not saved_jobs.exists():
        return Response({'errors':"No jobs saved"}, status=status.HTTP_204_NO_CONTENT)
    serializer = SavedJobsSerializer(saved_jobs.first())
    return Response({ 'saved_job': serializer.data },status=status.HTTP_200_OK)