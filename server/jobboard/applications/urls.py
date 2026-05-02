
from django.urls import path
from . import views

urlpatterns = [
    # Apply application
    path("<slug:job_slug>/apply/", views.post_application, name="post_application"),
    # View Applications
    path("my/", views.get_my_applications, name="get_my_applications"),
    # application by job
    path("job/<slug:slug>/", views.check_application_status, name="find_my_applications"),
    path("single/view/<slug:slug>/", views.get_single_applications, name="single_applications"),
    # View single application
    path(
        "<slug:slug>/",
        views.get_application_by_slug,
        name="get_application_by_slug",
    ),
    # Withdraw Application
    path(
        "<slug:slug>/withdraw/",
        views.update_my_applications,
        name="withdraw_application",
    ),
    # Get All Application of a job
    path(
        "<slug:slug>/jobs/check/applications/",
        views.get_job_applications,
        name="get_job_applications",
    ),
    # Get Single application of a job
    path(
        "<slug:slug>/jobs/status/<slug:application_slug>/",
        views.update_application_status,
        name="update_application_status",
    ),
]