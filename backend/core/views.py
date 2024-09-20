from django.shortcuts import redirect
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class RedirectURL(APIView):
    def get(self, request):
        workspace_id = request.GET.get('workspace_id')
        username = request.GET.get('username')
        scale_id = request.GET.get('scale_id')
        scale_type = request.GET.get('scale_type')
        channel_name = request.GET.get('channel')
        instance_name = request.GET.get('instance_name')
        channel_display_name = request.GET.get('channel_display_name')
        instance_display_name = request.GET.get('instance_display_name')

        if not all([workspace_id, username, scale_id, scale_type, channel_name, instance_name, channel_display_name, instance_display_name]):
            return redirect("https://dowellresearch.sg/")

        try:
            link = (
                f"https://www.scales.uxlivinglab.online/voc/scale/?"
                f"workspace_id={workspace_id}&username={username}&"
                f"scale_id={scale_id}&scale_type={scale_type}&"
                f"channel={channel_name}&instance_name={instance_name}&"
                f"channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
            )

            return redirect(link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")
@method_decorator(csrf_exempt, name='dispatch')
class RedirectURLForLLx(APIView):
    def get(self, request):
        workspace_id = request.GET.get('workspace_id')
        username = request.GET.get('username')
        scale_id = request.GET.get('scale_id')
        scale_type = request.GET.get('scale_type')
        channel_name = request.GET.get('channel')
        instance_name = request.GET.get('instance_name')
        channel_display_name = request.GET.get('channel_display_name')
        instance_display_name = request.GET.get('instance_display_name')

        if not all([workspace_id, username, scale_id, scale_type, channel_name, instance_name, channel_display_name, instance_display_name]):
            return redirect("https://dowellresearch.sg/")

        try:
            link = (
                f"https://www.scales.uxlivinglab.online/llx/scale/?"
                f"workspace_id={workspace_id}&username={username}&"
                f"scale_id={scale_id}&scale_type={scale_type}&"
                f"channel={channel_name}&instance_name={instance_name}&"
                f"channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
            )

            return redirect(link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")

@method_decorator(csrf_exempt, name='dispatch')
class ReportRedirectURL(APIView):
    def get(self, request):
        workspace_id = request.GET.get('workspace_id')
        username = request.GET.get('username')
        scale_id = request.GET.get('scale_id')

        if not all([workspace_id, username, scale_id]):
            return redirect("https://dowellresearch.sg/")

        try:
            report_link = (
                f"https://www.scales.uxlivinglab.online/voc/report/?"
                f"workspace_id={workspace_id}&username={username}&scale_id={scale_id}"
            )

            return redirect(report_link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")

@method_decorator(csrf_exempt, name='dispatch')
class ReportRedirectURLForLLx(APIView):
    def get(self, request):
        workspace_id = request.GET.get('workspace_id')
        username = request.GET.get('username')
        scale_id = request.GET.get('scale_id')

        if not all([workspace_id, username, scale_id]):
            return redirect("https://dowellresearch.sg/")

        try:
            report_link = (
                f"https://www.scales.uxlivinglab.online/llx/report/?"
                f"workspace_id={workspace_id}&username={username}&scale_id={scale_id}"
            )

            return redirect(report_link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")

@method_decorator(csrf_exempt, name='dispatch')
class LoginsRedirectURL(APIView):
    def get(self, request):
        workspace_name = request.GET.get('workspace_name')
        portfolio = request.GET.get('portfolio')

        if not workspace_name:
            return redirect("https://dowellresearch.sg/")
        
        try:
            login_link = (
                f"https://www.scales.uxlivinglab.online/voc/?workspace_name={workspace_name}"
            )

            if portfolio:
                login_link += f"&portfolio={portfolio}"

            return redirect(login_link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")

@method_decorator(csrf_exempt, name='dispatch')
class LoginsRedirectURLForLLx(APIView):
    def get(self, request):
        workspace_name = request.GET.get('workspace_name')
        portfolio = request.GET.get('portfolio')

        if not workspace_name:
            return redirect("https://dowellresearch.sg/")
        
        try:
            login_link = (
                f"https://www.scales.uxlivinglab.online/llx/?workspace_name={workspace_name}"
            )

            if portfolio:
                login_link += f"&portfolio={portfolio}"

            return redirect(login_link)
        except Exception as e:
            print("Exception:", e)
            return redirect("https://dowellresearch.sg/")