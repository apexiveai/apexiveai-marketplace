
from rest_framework import serializers

from .models import (
    Storefront,
    ListingCategory,
    Listing,
    ListingImage,
    CustomerEnquiry,
)


class StorefrontSerializer(serializers.ModelSerializer):
    class Meta:
        model = Storefront
        fields = "__all__"
        read_only_fields = ["id", "organization", "created_at"]


class ListingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingCategory
        fields = "__all__"


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "image", "alt_text", "sort_order"]


class ListingSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        source="organization.name",
        read_only=True
    )
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "organization",
            "organization_name",
            "category",
            "title",
            "slug",
            "listing_type",
            "description",
            "price",
            "currency",
            "is_available",
            "is_featured",
            "is_published",
            "images",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "slug",
            "is_featured",
            "is_published",
            "created_at",
        ]


class CustomerEnquirySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = CustomerEnquiry
        fields = [
            "id",
            "organization",
            "listing",
            "customer_name",
            "customer_email",
            "customer_phone",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "status",
            "created_at",
        ]
