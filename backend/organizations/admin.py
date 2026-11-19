from django.contrib import admin
from .models import Organization, OrganizationMembership

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = (
        "name", "industry", "status",
        "is_verified", "created_at"
    )
    list_filter = ("status", "industry", "is_verified")
    search_fields = ("name", "registration_number")
    readonly_fields = ("created_at", "updated_at")

admin.site.register(OrganizationMembership)