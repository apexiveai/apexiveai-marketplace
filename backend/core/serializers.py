
from rest_framework import serializers
from .models import Industry


class IndustrySerializer(serializers.ModelSerializer):
    organization_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Industry
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon",
            "image",
            "is_active",
            "sort_order",
            "organization_count",
        ]
        read_only_fields = ["id", "slug"]
