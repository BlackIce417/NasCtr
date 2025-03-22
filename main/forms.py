from django import forms
from .models import *

class PictureForm(forms.Form):
    image = forms.FileField(label='上传图像')
    description = forms.CharField(widget=forms.TextInput, 
                                  required=False, 
                                  label="备注",
                                  initial="")
    
    # class Meta: 
    #     label_suffix = ""
    #     model = Picture
    #     fields = ("image", "description")







