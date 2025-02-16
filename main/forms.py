from django import forms

class PictureForm(forms.Form):
    image = forms.ImageField(label='Image')
    description = forms.CharField(widget=forms.Textarea, required=False, label="Description")







