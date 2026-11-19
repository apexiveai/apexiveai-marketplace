
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh")

        if not token:
            return Response(
                {"detail": "Refresh token is required."},
                status=400
            )

        try:
            RefreshToken(token).blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid refresh token."},
                status=400
            )

        return Response({"detail": "Logged out successfully."})
