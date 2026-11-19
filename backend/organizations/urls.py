
from django.urls import path

from .views import (
    OrganizationRegistrationView,
    OrganizationListView,
    MyOrganizationsView,
    OrganizationAdminView,
    OrganizationApprovalView,
)

urlpatterns = [
    path(
        "register/",
        OrganizationRegistrationView.as_view(),
        name="organization-register"
    ),
    path(
        "",
        OrganizationListView.as_view(),
        name="organization-list"
    ),
    path(
        "my/",
        MyOrganizationsView.as_view(),
        name="my-organizations"
    ),
    path(
        "admin/",
        OrganizationAdminView.as_view(),
        name="organization-admin"
    ),
    path(
        "admin/<int:pk>/approval/",
        OrganizationApprovalView.as_view(),
        name="organization-approval"
    ),
]
