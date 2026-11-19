
from django.db.models import Count
from rest_framework import generics, permissions
from django.db.models import Count, Q
from .models import Industry
from .serializers import IndustrySerializer

class IndustryListView(generics.ListAPIView):
    serializer_class = IndustrySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Industry.objects.filter(is_active=True).annotate(
            organization_count=Count(
                "organizations",
                filter=Q(organizations__status="approved"),
            )
        )


class IndustryAdminView(generics.ListCreateAPIView):
    serializer_class = IndustrySerializer
    permission_classes = [permissions.IsAdminUser]

    queryset = Industry.objects.all()


class IndustryDetailAdminView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = IndustrySerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Industry.objects.all()
