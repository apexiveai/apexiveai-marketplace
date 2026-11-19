
from django.db import transaction
from rest_framework import serializers

from .models import Organization, OrganizationMembership
from marketplace.models import Storefront


class OrganizationSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(
        source="industry.name",
        read_only=True
    )

    class Meta:
        model = Organization
        fields = [
            "id",
            "industry",
            "industry_name",
            "name",
            "slug",
            "registration_number",
            "description",
            "logo",
            "cover_image",
            "email",
            "phone",
            "website",
            "address",
            "city",
            "status",
            "is_verified",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "status",
            "is_verified",
            "created_at",
        ]


class OrganizationRegistrationSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Organization
        fields = [
            "industry",
            "name",
            "registration_number",
            "description",
            "email",
            "phone",
            "website",
            "address",
            "city",
        ]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        organization = Organization.objects.create(
            **validated_data
        )

        OrganizationMembership.objects.create(
            organization=organization,
            user=user,
            role=OrganizationMembership.Role.OWNER,
        )

        Storefront.objects.create(
            organization=organization,
            title=organization.name,
        )

        return organization
