from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication normally enforces CSRF for unsafe methods.
    This API is consumed by a separate SPA frontend that does not send CSRF tokens.

    Security note: only use with proper CORS + credential restrictions for admin APIs.
    """

    def enforce_csrf(self, request):
        return

