from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('setQuery', views.setQuery, name='setQuery'),
    path('subsetQuery', views.subsetQuery, name='subsetQuery'),
]