<script>
  import { onMount } from 'svelte';
  import { map } from 'rxjs/operators';
  import loadGoogleMapsApi from 'load-google-maps-api';
  import MarkerClusterer from '@google/markerclusterer';

  export let locations;

  let searchBoxElement;
  let mapElement;
  let googleMap;

  loadGoogleMapsApi({
    key: '<@GOOGLE_MAPS_API_KEY@>',
    libraries: ['places'],
  })
    .then(maps => {
      googleMap = new maps.Map(mapElement, {
        center: new maps.LatLng(0, 0),
        zoom: Math.ceil(Math.log2(window.innerWidth)) - 8,
        mapTypeId: 'roadmap',
      });

      // Create the search box and link it to the UI element.
      const searchBox = new maps.places.SearchBox(searchBoxElement);
      googleMap.controls[maps.ControlPosition.TOP_LEFT].push(searchBoxElement);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        const bounds = new maps.LatLngBounds();
        places.forEach(place => {
          if (!place.geometry) {
            return;
          }

          googleMap.setCenter(place.geometry.location);

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        googleMap.fitBounds(bounds);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          googleMap.setCenter(
            new maps.LatLng(position.coords.latitude, position.coords.longitude)
          );
          googleMap.setZoom(10);
        });
      }

      const markerClusterer = new MarkerClusterer(googleMap, [], {
        gridSize: 50,
        maxZoom: 12,
        imagePath:
          'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      });
      const infoWindow = new maps.InfoWindow();
      locations.subscribe(ls => {
        const newMarkers = ls.map(l => {
          const marker = new maps.Marker({
            position: new maps.LatLng(
              l.location.latitude,
              l.location.longitude
            ),
            label: ls.name,
          });
          marker.addListener('click', function() {
            infoWindow.setContent(l.name);
            infoWindow.open(googleMap, marker);
          });
          return marker;
        });
        markerClusterer.addMarkers(newMarkers);
      });
    })
    .catch(function(error) {
      console.error(error);
    });
</script>

<style>
  div {
    flex: 1 0 auto;
    height: 100%;
    width: 100%;
  }
</style>

<input bind:this={searchBoxElement} class="controls" type="text" placeholder="Search"/>
<div bind:this={mapElement}/>
