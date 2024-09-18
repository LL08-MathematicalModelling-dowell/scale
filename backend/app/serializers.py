from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    portfolio = serializers.CharField()
    password = serializers.CharField()

class ScaleDetailsSerializer(serializers.Serializer):
    TYPE_OF_SCALE = (
        ('nps', 'nps'),
        ('nps_lite', 'nps_lite'),
        ('stapel', 'stapel'),
        ('likert', 'likert'),
        ('percent', 'percent'),
        ('percent_sum', 'percent_sum')
    )
    workspace_id = serializers.CharField()
    portfolio = serializers.CharField()
    type_of_scale = serializers.ChoiceField(choices=TYPE_OF_SCALE)

class ScaleRetrieveSerializer(serializers.Serializer):
    workspace_id = serializers.CharField()
    username = serializers.CharField()
    portfolio = serializers.CharField()
    portfolio_username = serializers.CharField()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    user_id = serializers.CharField()

class SaceScaleDetailsSerializer(serializers.Serializer):
    TYPE_OF_SCALE = (
        ('nps', 'nps'),
        ('nps_lite', 'nps_lite'),
        ('stapel', 'stapel'),
        ('likert', 'likert'),
        ('percent', 'percent'),
        ('percent_sum', 'percent_sum')
    )
    
    workspace_id = serializers.CharField()
    username = serializers.CharField()
    portfolio = serializers.CharField()
    portfolio_username = serializers.CharField()
    type_of_scale = serializers.ChoiceField(choices=TYPE_OF_SCALE)

class UserAuthSerializer(serializers.Serializer):
    workspace_name = serializers.CharField()
    portfolio = serializers.CharField()
    password = serializers.CharField()


class UserUpdateSerializer(serializers.Serializer):
    email = serializers.CharField(required=False,allow_blank=True)
    profile_image = serializers.CharField(required=False,allow_blank=True)


class InstanceDetailsSerializer(serializers.Serializer):
    instance_name = serializers.CharField()
    instance_display_name = serializers.CharField()

class ChannelInstanceSerializer(serializers.Serializer):
    channel_name = serializers.CharField()
    channel_display_name = serializers.CharField()
    instances_details = InstanceDetailsSerializer(many=True)

class ScaleCreationSerializer(serializers.Serializer):
    api_key = serializers.CharField(max_length=100, allow_blank=False)
    workspace_id = serializers.CharField(max_length=100, allow_blank=False)
    username = serializers.CharField(max_length=100, allow_blank=False)
    scale_name = serializers.CharField(max_length=100, allow_blank=False)
    scale_type = serializers.CharField(max_length=100, allow_blank=False)
    user_type = serializers.BooleanField()
    no_of_responses = serializers.IntegerField(allow_null=False)
    pointers = serializers.IntegerField(required=False)
    axis_limit = serializers.IntegerField(required=False)
    channel_instance_list = ChannelInstanceSerializer(many=True)

    def validate(self, data):
        scale_type = data.get('scale_type')

        if scale_type == 'stapel' and not data.get('axis_limit'):
            raise serializers.ValidationError({'axis_limit': 'This field is required for Stapel scale.'})

        if scale_type == 'likert' and not data.get('pointers'):
            raise serializers.ValidationError({'pointers': 'This field is required for Likert scale.'})

        return data
    
class ScaleResponseSerializer(serializers.Serializer):
    SCALE_TYPE_CHOICES = (
        ('nps', 'nps'),
        ('nps_lite', 'nps_lite'),
        ('stapel', 'stapel'),
        ('likert', 'likert'),
        ('percent', 'percent'),
        ('percent_sum', 'percent_sum'),
        ('learning_index', 'learning_index')
    )
    workspace_id = serializers.CharField(max_length=100, allow_blank=False)
    scale_id = serializers.CharField(max_length=100, allow_blank=True)
    username = serializers.CharField(max_length=100, allow_blank=True)
    scale_type = serializers.ChoiceField(choices=SCALE_TYPE_CHOICES)
    user_type = serializers.CharField(max_length=100, allow_blank=False)
    channel_name = serializers.CharField(max_length=100, allow_blank=False)
    instance_name = serializers.CharField(max_length=100, allow_blank=False)

    
class ScaleRetrievalSerializer(serializers.Serializer):
    SCALE_TYPE_CHOICES = (
        ('nps', 'nps'),
        ('nps_lite', 'nps_lite'),
        ('stapel', 'stapel'),
        ('likert', 'likert'),
        ('percent', 'percent'),
        ('percent_sum', 'percent_sum')
    )
    api_key = serializers.CharField(max_length=100, allow_blank=False, required=True)
    workspace_id = serializers.CharField(max_length=100, allow_blank=False, required=True)
    scale_id = serializers.CharField(max_length=100, allow_blank=True, required=False)
    username = serializers.CharField(max_length=100, allow_blank=True, required=False)
    scale_type = serializers.ChoiceField(choices=SCALE_TYPE_CHOICES)
    
