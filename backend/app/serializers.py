from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    portfolio = serializers.CharField()
    password = serializers.CharField()

class ScaleDetailsSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    portfolio = serializers.CharField()

class ScaleRetrieveSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    username = serializers.CharField()
    portfolio = serializers.CharField()

class UserAuthSerializer(serializers.Serializer):
    workspace_name = serializers.CharField()
    portfolio = serializers.CharField()
    password = serializers.CharField()


class UserUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False,allow_blank=True)
    time_zone = serializers.CharField(required=False,allow_blank=True)
    phone = serializers.CharField(required=False,allow_blank=True)
    email = serializers.CharField(required=False,allow_blank=True)
    password = serializers.CharField(required=False,allow_blank=True)
    portfolio = serializers.CharField(required=False,allow_blank=True)