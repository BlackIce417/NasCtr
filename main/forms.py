from django import forms

class PictureForm(forms.Form):
    image = forms.ImageField(label='上传图像')
    description = forms.CharField(widget=forms.TextInput, 
                                  required=False, 
                                  label="备注",
                                  initial="")







