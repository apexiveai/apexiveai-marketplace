
from django.db import models
from django.conf import settings


class Storefront(models.Model):
    organization = models.OneToOneField(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="storefront"
    )
    title = models.CharField(max_length=200)
    tagline = models.CharField(max_length=255, blank=True)
    theme_color = models.CharField(
        max_length=20, default="#111827"
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "storefronts"

    def __str__(self):
        return self.title


class ListingCategory(models.Model):
    industry = models.ForeignKey(
        "core.Industry",
        on_delete=models.CASCADE,
        related_name="listing_categories"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children"
    )
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "listing_categories"
        constraints = [
            models.UniqueConstraint(
                fields=["industry", "slug"],
                name="unique_industry_category_slug"
            )
        ]

    def __str__(self):
        return self.name


class Listing(models.Model):

    class ListingType(models.TextChoices):
        PRODUCT = "product", "Product"
        SERVICE = "service", "Service"
        VEHICLE = "vehicle", "Vehicle"
        PROPERTY = "property", "Property"
        PROJECT = "project", "Project"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="listings"
    )
    category = models.ForeignKey(
        ListingCategory,
        on_delete=models.PROTECT,
        related_name="listings",
        null=True,
        blank=True
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280)
    listing_type = models.CharField(
        max_length=20,
        choices=ListingType.choices
    )
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        null=True,
        blank=True
    )
    currency = models.CharField(max_length=3, default="MMK")

    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "listings"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "slug"],
                name="unique_org_listing_slug"
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="listings/")
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "listing_images"
        ordering = ["sort_order"]


class CustomerEnquiry(models.Model):

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        IN_PROGRESS = "in_progress", "In Progress"
        CLOSED = "closed", "Closed"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="enquiries"
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=30)
    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "customer_enquiries"
        ordering = ["-created_at"]

    def __str__(self):
        return self.customer_name
