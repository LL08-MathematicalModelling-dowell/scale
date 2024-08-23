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
    portfolio_username = serializers.CharField()

class UserAuthSerializer(serializers.Serializer):
    workspace_name = serializers.CharField()
    portfolio = serializers.CharField()
    password = serializers.CharField()


class UserUpdateSerializer(serializers.Serializer):
    email = serializers.CharField(required=False,allow_blank=True)
    profile_image = serializers.CharField(required=False,allow_blank=True)


class ScaleSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    username = serializers.CharField()
    scale_name = serializers.CharField()
    scale_type = serializers.CharField()
    user_type = serializers.BooleanField()
    no_of_responses = serializers.IntegerField()
    channel_instance_list = serializers.ListField()
    pointers = serializers.IntegerField(required=False)
    axis_limit = serializers.IntegerField(required=False)
    redirect_url = serializers.URLField(required=False)

class InstanceDetailsSerializer(serializers.Serializer):
    instance_name = serializers.CharField()
    instance_display_name = serializers.CharField()


class ChannelInstanceSerializer(serializers.Serializer):
    channel_name = serializers.CharField()
    channel_display_name = serializers.CharField()
    instances_details = InstanceDetailsSerializer(many=True)

class CreateCollectionSerializer(serializers.Serializer):
    DATABASE_CHOICES = (
        ("META DATA","META DATA"),
        ("DATA","DATA"),
    )
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    collection_name = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    database_type = serializers.ChoiceField(choices=DATABASE_CHOICES)
