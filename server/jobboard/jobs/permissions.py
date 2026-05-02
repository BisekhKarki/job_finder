from rest_framework.permissions import BasePermission 


class IsEmployer(BasePermission):
    # Access to Employee only
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_employer()
    

class IsApplicant(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_applicant()
    

class IsJobOwner(BasePermission):
    def has_permission(self, request, view,obj):
        return obj.company.owner == request.user