<script>
  import { onMount } from 'svelte';
  import { map } from 'rxjs/operators';
  import loadGoogleMapsApi from 'load-google-maps-api';
  import MarkerClusterer from '@google/markerclusterer';

  export let locations;

  let mapElement;
  let googleMap;

  loadGoogleMapsApi({
    key: '<@GOOGLE_MAPS_API_KEY@>',
  })
    .then(maps => {
      googleMap = new maps.Map(mapElement, {
        center: new maps.LatLng(0, 0),
        zoom: Math.ceil(Math.log2(window.innerWidth)) - 8,
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

<div bind:this={mapElement} />
