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

<style lang="scss">
  div.map {
    flex: 1 0 auto;
    height: 100%;
    width: 100%;

    >.controls {
      display: none;
    }

    .controls {
      margin-top: 10px;
      border: 1px solid transparent;
      border-radius: 2px 0 0 2px;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      height: 40px;
      outline: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

      &.searchBox {
        background-color: #fff;
        font-family: Roboto, Arial, sans-serif;
        font-size: 18px;
        font-weight: 400;
        margin-left: 12px;
        padding: 0 11px 0 13px;
        text-overflow: ellipsis;
        width: 50%;

        &:focus {
          border-color: #4d90fe;
        }
      }
    }
  }

</style>

<div class="map" bind:this={mapElement}>
  <input bind:this={searchBoxElement} class="controls searchBox" type="text" placeholder="Search"/>
</div>
