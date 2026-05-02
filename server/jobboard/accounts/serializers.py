from rest_framework import serializers
from .models import UserModel

class UserModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserModel
        fields = ['id','username','email','role','avatar','bio','password','address','account_status','phone','created_at']
        extra_kwargs = {
            'password':{
                'write_only':True
            }
        }

    def create(self, validated_data):
        role = validated_data.get('role')
        user = UserModel.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role 
        )
        return user
    
    




