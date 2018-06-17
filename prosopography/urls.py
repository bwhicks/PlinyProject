from django.conf.urls import url
from .views import (PersonListView, person_autocomplete,
                    PersonAutoComplete, NodeEdgeListView,
                    PersonDetailView, SocialClassView)

urlpatterns = [
    url(r'^(?P<slug>[-\w\d]+)-(?P<id>\d+)/$', PersonDetailView.as_view(), name='detail'),
    url(r'^$', PersonListView.as_view(), name='search'),
    url(r'^autocomplete/$', person_autocomplete, name='autocomplete'),
    url(r'^dal-autocomplete/$', PersonAutoComplete.as_view(),
        name='dal-autocomplete'),
    url(r'^nodes.json$', NodeEdgeListView.as_view(), name='nodes'),
    url(r'^social_class.json$', SocialClassView.as_view(), name='classes')
]
