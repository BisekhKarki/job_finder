from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from .models import Application
from rest_framework.response import Response
from .serializers import ApplicationSerializer
from django.shortcuts import get_object_or_404
from jobs.models import JobModel
from jobs.views import IsEmployeeUser
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


class IsApplicantUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_applicant


@api_view(["POST"])
@permission_classes([IsApplicantUser])
def post_application(request, job_slug):
    print(request.data)
    applicant = request.user
    if not job_slug:
        return Response(
            {"error": "job_slug is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    job = get_object_or_404(JobModel, slug =job_slug, is_active=True)
    print("Job\n",job)
    if Application.objects.filter(job=job, applicant=applicant).exists():
        return Response(
            {"message": "You have already submitted the application"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = ApplicationSerializer(data = request.data)
    print("Serializer\n",serializer)
    if serializer.is_valid():
        serializer.save(job=job, applicant=applicant)
        return Response({'application': serializer.data}, status=status.HTTP_201_CREATED)
    return Response({'error': serializer.error_messages}, status=status.HTTP_400_BAD_REQUEST)
    



@api_view(['GET'])
@permission_classes([IsApplicantUser])
def get_my_applications(request):
    applications = Application.objects.filter(applicant=request.user)
    if not applications.exists():
        return Response(
            {"message": "No applications found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = ApplicationSerializer(applications, many=True)
    return Response({'applications': serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsApplicantUser])
def get_application_by_slug(request, slug):
    user = request.user
    try:
        application = Application.objects.get(slug=slug)
        if application.applicant != user:
            return Response({'message':'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    except Application.DoesNotExist:
        return Response(
            {"message": "No application found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = ApplicationSerializer(application)
    return Response({'application': serializer.data}, status=status.HTTP_200_OK)




@api_view(['DELETE'])
@permission_classes([IsApplicantUser])
def update_my_applications(request, slug):
    user = request.user
    try:
        application = Application.objects.get(slug=slug)
        if application.applicant != user:
            return Response({'message':'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    except Application.DoesNotExist:
        return Response(
            {"message": "No application found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if application.status == "REJECTED" or application.status == "HIRED":
        return Response({'message':"Your application cannot be withdrawn"}, status=status.HTTP_400_BAD_REQUEST)
    application.status = application.status.WITHDRAWN
    application.save()
    serializer = ApplicationSerializer(application)
    return Response({'application': serializer.data,"message":"Application has been withdrawn"}, status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsEmployeeUser])
def get_job_applications(request,slug):
    job = get_object_or_404(JobModel, slug=slug)
    if job.created_by != request.user:
        return Response({'message':'unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    applications = Application.objects.filter(job=job)
    if not applications.exists():
        return Response(
            {"message": "No applications found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = ApplicationSerializer(applications,many=True)
    return Response({'applications':serializer.data},status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsEmployeeUser])
def get_single_applications(request,slug):
    applications = Application.objects.get(slug=slug)
    print(applications)
    if applications is None:
        return Response(
            {"message": "No applications found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if  applications.job.created_by != request.user:
        return Response({'message':'unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ApplicationSerializer(applications)
    return Response({'applications':serializer.data},status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsApplicantUser])
def check_application_status(request,slug):
    job = get_object_or_404(JobModel, slug=slug)
    applications = Application.objects.filter(job=job)
    if not applications.exists():
        return Response(
            {"message": "No applications found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = ApplicationSerializer(applications.first())
    return Response({'application':serializer.data},status=status.HTTP_200_OK)
    



@api_view(["PATCH"])
@permission_classes([IsEmployeeUser])
def update_application_status(request, slug,application_slug):
    job = get_object_or_404(JobModel, slug=slug)
    if job.created_by != request.user:
        return Response({'message':'unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    try:
        application = Application.objects.get(slug=application_slug)
    except Application.DoesNotExist:
        return Response(
            {"message": "No applications found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    new_status = request.data.get("status")
    valid_status = [choice[0] for choice in Application.Status.choices]
    if new_status not in valid_status:
        return Response(
            {"message": "Invalid status"},
            status=status.HTTP_400_BAD_REQUEST
        )
    application.status = new_status
    application.save()
    send_email_to_user(application=application)
    serializer = ApplicationSerializer(application)
    return Response({'message':'application status updated', 'application':serializer.data},status=status.HTTP_200_OK)






def send_email_to_user(application):
    user = application.applicant
    job = application.job
    company = application.job.company

    context = {
        "username": user.username,
        "job_title": job.title,
        "company_name": company.company_name,
        "status": application.status
    }

    subject_map ={
        "shortlisted": f"You've been shortlisted for {job.title}",
        "interviewing": f"Interview Invitation for {job.title}",
        "hired": f"Congratulations! You're hired 🎉",
        "rejected": f"Update on your application for {job.title}",
    }

    subject = subject_map.get(application.status)
    if not subject:
        return 
    html_content = render_to_string("emails/application_status.html", context)
    text_content = f"""
    Hi {user.username},

    Your application status has been updated to {application.status} for {job.title} at {company.company_name}.
    """
    email = EmailMultiAlternatives(
        subject, 
        text_content, 
        settings.EMAIL_HOST_USER,
        [user.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
    return
    

    




