from django.utils.deprecation import MiddlewareMixin


class ForceApiCorsMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        origin = request.META.get('HTTP_ORIGIN')
        if origin and request.path.startswith('/api/'):
            response.setdefault('Access-Control-Allow-Origin', origin)
            response.setdefault('Access-Control-Allow-Credentials', 'true')
            response.setdefault('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            response.setdefault('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CSRFToken, X-Requested-With, X-ADMIN-SETUP-TOKEN')
            response.setdefault('Vary', 'Origin')
        return response
