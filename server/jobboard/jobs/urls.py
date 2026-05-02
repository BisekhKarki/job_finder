from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_all_jobs, name='job-list'),

    # tags
    path('tags/', views.tagsView, name='tag-list'),
    path('tags/add/', views.add_tags, name='tag-add'),
    path('tags/remove/<slug:slug>/', views.delete_tags, name='tag-delete'),

    # companies
    path('companies/', views.get_all_companies, name='company-list'),
    path('companies/<slug:slug>/', views.get_company_by_slug, name='company-detail'),
    path('company/my/', views.get_my_company, name='my-company-detail'),
    path('company/create/', views.post_company, name='add company'),
    path('company/<slug:slug>/update/', views.update_or_delete_company, name='add company'),

    # jobs
    path('create/', views.post_jobs, name='job-create'),
    path('list/all/', views.get_my_jobs, name='job-list-my'),
    path('<slug:slug>/', views.get_jobs_by_slug, name='job-detail'),
    path('<slug:slug>/update/', views.update_or_delete_jobs, name='job-update'),
    path('<slug:slug>/delete/', views.update_or_delete_jobs, name='job-delete'),
    path('my-jobs/', views.get_my_jobs, name='my-jobs'),
    path('<slug:slug>/toggle-status/', views.jobToggleStatusView, name='job-toggle-status'),

    # Applicants logics apply below views
    path('<slug:slug>/save/', views.save_jobs, name='save-job'),
    path('saved/all/', views.get_all_saved_jobs, name='saved-all-jobs'),
    path('saved/<int:id>/', views.get_current_job_saved, name='saved-jobs'),
]