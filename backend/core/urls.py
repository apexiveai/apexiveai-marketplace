
from django.urls import path

from .views import (
    IndustryListView,
    IndustryAdminView,
    IndustryDetailAdminView,
)

urlpatterns = [
    path("", IndustryListView.as_view(), name="industry-list"),
    path(
        "admin/",
        IndustryAdminView.as_view(),
        name="industry-admin"
    ),
    path(
        "admin/<int:pk>/",
        IndustryDetailAdminView.as_view(),
        name="industry-detail-admin"
    ),
]
