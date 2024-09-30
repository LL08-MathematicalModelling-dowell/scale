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
        ('percent_sum', 'percent_sum'),
        ('learning_index', 'learning_index')
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
    DATA_TYPE_CHOICES = (
        ('real', 'real'),
        ('testing', 'testing')
    )
    workspace_id = serializers.CharField(max_length=100, allow_blank=False)
    scale_id = serializers.CharField(max_length=100, allow_blank=False)
    username = serializers.CharField(max_length=100, allow_blank=True)
    scale_type = serializers.ChoiceField(choices=SCALE_TYPE_CHOICES)
    user_type = serializers.CharField(max_length=100, allow_blank=False)
    channel_name = serializers.CharField(max_length=100, allow_blank=False)
    instance_name = serializers.CharField(max_length=100, allow_blank=False)
    data_type = serializers.ChoiceField(choices=DATA_TYPE_CHOICES,allow_blank=False,default=None)

    
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
    
class ScaleReportSerializer(serializers.Serializer):
    SCALE_TYPE_CHOICES = (
        ("nps", "nps"),
        ("nps_lite", "nps_lite"),
        ("stapel", "stapel"),
        ("likert", "likert"),
        ("learning_index","learning_index")
    )
    PERIOD_CHOICES = (
        ("twenty_four_hours", "24 hours"),
        ("seven_days", "Seven Days"),
        ("fifteen_days", "Fifteen Days"),
        ("thirty_days", "Thirty Days"),
        ("ninety_days","Ninety Days"),
        ("one_year", "One Year")
    )
    scale_type = serializers.ChoiceField(choices = SCALE_TYPE_CHOICES)
    scale_id = serializers.CharField()
    # workspace_id = serializers.CharField(allow_blank=False)
    channel_names = serializers.ListField(child=serializers.CharField())
    instance_names = serializers.ListField(child=serializers.CharField())
    period = serializers.ChoiceField(allow_blank=False, choices=PERIOD_CHOICES)