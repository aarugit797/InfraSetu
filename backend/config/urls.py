from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


def api_root_html(request):
    return HttpResponse("""
    <html>
        <head>
            <title>InfraSetu API Status</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; background: #f8fafc; }
                .card { background: white; padding: 30px; border-radius: 12px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                h1 { color: #f59e0b; margin-top: 0; }
                .status { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 10px; padding: 10px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; }
                code { background: #fee2e2; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>InfraSetu Backend</h1>
                <p>The Django API server is <span class="status">LIVE ✓</span> and ready.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p><b>Useful Endpoints:</b></p>
                <ul>
                    <li><code>/api/token/</code> - JWT Authentication</li>
                    <li><code>/admin/</code> - Database Management</li>
                    <li><code>/api/accounts/profile/</code> - User Data</li>
                    <li><code>/api/projects/projects/</code> - Construction Projects</li>
                </ul>
                <p style="color: #64748b; font-size: 0.875rem; margin-top: 30px;">
                    Note: This server is currently providing data to the Vite frontend at <code>http://localhost:5173</code>.
                </p>
            </div>
        </body>
    </html>
    """)


urlpatterns = [
    # Root → HTML status page
    path("", api_root_html, name="api-root-html"),
    path("api/", api_root_html, name="api-root"),

    # Admin
    path("admin/", admin.site.urls),

    # JWT Auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # App APIs
    path("api/accounts/", include("accounts.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/tasks/", include("tasks.urls")),
    path("api/workforce/", include("workforce.urls")),
    path("api/resources/", include("resources.urls")),
    path("api/finance/", include("finance.urls")),
    path("api/logistics/", include("logistics.urls")),
]
