
from django.urls import path

from .views import (
    ListingListView,
    ListingCreateView,
    CustomerEnquiryCreateView,
)

urlpatterns = [
    path("listings/", ListingListView.as_view(), name="listing-list"),
    path("listings/create/", ListingCreateView.as_view(), name="listing-create"),
    path("enquiries/", CustomerEnquiryCreateView.as_view(), name="enquiry-create"),
]
