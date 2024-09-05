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


