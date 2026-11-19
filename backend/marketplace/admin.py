from django.contrib import admin
from .models import (
    Storefront,
    ListingCategory,
    Listing,
    ListingImage,
    CustomerEnquiry,
)

admin.site.register(Storefront)
admin.site.register(ListingCategory)
admin.site.register(ListingImage)

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "title", "organization", "listing_type",
        "price", "is_published", "is_featured"
    )
    list_filter = ("listing_type", "is_published")
    search_fields = ("title", "organization__name")

@admin.register(CustomerEnquiry)
class CustomerEnquiryAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name", "organization",
        "status", "created_at"
    )
    list_filter = ("status",)