
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from organizations.models import OrganizationMembership
from .models import Listing, CustomerEnquiry
from .serializers import (
    ListingSerializer,
    CustomerEnquirySerializer,
)


class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Listing.objects.filter(
            is_published=True,
            is_available=True,
            organization__status="approved"
        ).select_related(
            "organization", "category"
        ).prefetch_related("images")

        industry = self.request.query_params.get("industry")
        organization = self.request.query_params.get(
            "organization"
        )
        listing_type = self.request.query_params.get("type")
        search = self.request.query_params.get("search")

        if industry:
            queryset = queryset.filter(
                organization__industry__slug=industry
            )

        if organization:
            queryset = queryset.filter(
                organization__slug=organization
            )

        if listing_type:
            queryset = queryset.filter(
                listing_type=listing_type
            )

        if search:
            queryset = queryset.filter(
                title__icontains=search
            )

        return queryset


class ListingCreateView(generics.CreateAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        organization_id = self.request.data.get(
            "organization_id"
        )

        membership = OrganizationMembership.objects.filter(
            organization_id=organization_id,
            user=self.request.user,
            is_active=True,
            role__in=["owner", "admin", "manager"]
        ).select_related("organization").first()

        if not membership:
            raise PermissionDenied(
                "You do not have permission to manage this company."
            )

        if membership.organization.status != "approved":
            raise PermissionDenied(
                "Your company must be approved before publishing listings."
            )

        serializer.save(organization=membership.organization)


class CustomerEnquiryCreateView(generics.CreateAPIView):
    serializer_class = CustomerEnquirySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        listing_id = self.request.data.get("listing")

        listing = get_object_or_404(
            Listing.objects.select_related("organization"),
            pk=listing_id,
            is_published=True,
            is_available=True,
            organization__status="approved"
        )

        serializer.save(
            organization=listing.organization,
            customer=(
                self.request.user
                if self.request.user.is_authenticated
                else None
            )
        )
