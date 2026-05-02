from django.shortcuts import render
from .models import UserModel
from .serializers import UserModelSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
import time



class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field ='email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user=user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['email'] = self.user.email
        data['role'] = self.user.role
        return  data
        


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class IsEmployerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_employer())


class IsApplicantUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_applicant())

@api_view(['GET'])
def get_all_users(request):
    user = UserModel.objects.all()
    serializer = UserModelSerializer(user, many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(['POST'])
def register_user(request):
    user = request.data
    if user is None:
        return Response({'error':'user is not registered'})
    user_serializer = UserModelSerializer(data=user)
    if user_serializer.is_valid():
        user_serializer.save()
        return Response(user_serializer.data,status=status.HTTP_201_CREATED)
    return Response(user_serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    serializer = UserModelSerializer(request.user)
    # print(serializer.data)
    return Response({'user': serializer.data}, status=status.HTTP_200_OK )


@api_view(['GET'])
@permission_classes([IsEmployerUser])
def get_employee_profile(request):
    serializer = UserModelSerializer(request.user)
    return Response({'user': serializer.data}, status=status.HTTP_200_OK )


@api_view(['GET'])
@permission_classes([IsApplicantUser])
def get_applicant_profile(request):
    serializer = UserModelSerializer(request.user)
    return Response({'user': serializer.data}, status=status.HTTP_200_OK )





@api_view(['PUT',"PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserModelSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        
        serializer.save()
        print(serializer.data)
        return Response({'updated_user': serializer.data}, status=status.HTTP_200_OK )
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    try:
        user = UserModel.objects.get(email=email)
        uuid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"http://localhost:3000/password-reset/{uuid}/{token}"

        send_mail(
            "Reset your password",
            f"Clikk here: {reset_link}",
            "noreply@example.com",
            [email]
        )
        # print(reset_link)

        return Response({"message":"An email has been sent to the email you have provided"}, status=status.HTTP_200_OK)
    
    except UserModel.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    

@api_view(['POST'])
def reset_password(request):
    uuid = request.data.get('uuid')
    token = request.data.get('token')
    password = request.data.get('password')

    print("uuid", uuid)
    print("token", token)
    print("password", password)

    try:
        user_id = urlsafe_base64_decode(uuid).decode()
        user = UserModel.objects.get(pk=user_id)

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({"message": "Password reset successful"})
        else:
            return Response({"error": "Invalid token"}, status=400)
    except Exception:
        return Response({"error": "Invalid request"}, status=400)




