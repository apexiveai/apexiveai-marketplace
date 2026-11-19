
from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Organization(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        SUSPENDED = "suspended", "Suspended"

    industry = models.ForeignKey(
        "core.Industry",
        on_delete=models.PROTECT,
        related_name="organizations"
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    registration_number = models.CharField(
        max_length=100, blank=True
    )

    description = models.TextField(blank=True)
    logo = models.ImageField(
        upload_to="organizations/logos/",
        blank=True,
        null=True
    )
    cover_image = models.ImageField(
        upload_to="organizations/covers/",
        blank=True,
        null=True
    )

    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "organizations"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            candidate = base
            counter = 2

            while Organization.objects.filter(
                slug=candidate
            ).exclude(pk=self.pk).exists():
                candidate = f"{base}-{counter}"
                counter += 1

            self.slug = candidate

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class OrganizationMembership(models.Model):

    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Administrator"
        MANAGER = "manager", "Manager"
        STAFF = "staff", "Staff"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships"
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organization_memberships"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "user"],
                name="unique_organization_member"
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.organization}"
