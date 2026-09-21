from django.contrib import admin
from .models import User, BugReport

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "created_at"]
    search_fields = ["email"]
    ordering = ["-created_at"]


@admin.register(BugReport)
class BugReportAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "severity", "is_resolved", "created_at"]
    search_fields = ["title", "user__email"]
    list_filter = ["severity", "is_resolved", "created_at"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]