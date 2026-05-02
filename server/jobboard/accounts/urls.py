from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .views import EmailTokenObtainPairView, register_user, get_my_profile, update_profile, get_all_users, get_employee_profile, get_applicant_profile, forgot_password, reset_password
urlpatterns =[
    path('auth-tokens/',  EmailTokenObtainPairView.as_view()),
    path('refresh/token/',TokenRefreshView.as_view()),
    path('register/',register_user),
    path('auth/me/',get_my_profile),
    path('auth/employer-profile/',get_employee_profile),
    path('auth/applicant-profile/',get_applicant_profile),
    path('auth/update-profile/',update_profile),
    path('all/',get_all_users),
    path('logout/',TokenBlacklistView.as_view()),
    path('reset-password/',reset_password),
    path('password-reset/',forgot_password)


]