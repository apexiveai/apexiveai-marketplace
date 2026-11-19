
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Organization
from .serializers import (
    OrganizationSerializer,
    OrganizationRegistrationSerializer,
)


class OrganizationRegistrationView(
    generics.CreateAPIView
):
    serializer_class = OrganizationRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Organization.objects.filter(
            status=Organization.Status.APPROVED
        ).select_related("industry")


class MyOrganizationsView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Organization.objects.filter(
            memberships__user=self.request.user,
            memberships__is_active=True
        ).select_related("industry").distinct()


class OrganizationAdminView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Organization.objects.all().select_related(
            "industry"
        )

        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(status=status)

        return queryset


class OrganizationApprovalView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        organization = generics.get_object_or_404(
            Organization,
            pk=pk
        )

        action = request.data.get("action")

        if action == "approve":
            organization.status = Organization.Status.APPROVED
            organization.is_verified = True

        elif action == "reject":
            organization.status = Organization.Status.REJECTED
            organization.is_verified = False

        elif action == "suspend":
            organization.status = Organization.Status.SUSPENDED
            organization.is_verified = False

        else:
            return Response(
                {"detail": "Invalid approval action."},
                status=400
            )

        organization.save(
            update_fields=["status", "is_verified", "updated_at"]
        )

        return Response(
            OrganizationSerializer(organization).data
        )
