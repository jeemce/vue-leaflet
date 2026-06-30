import { inject, computed, readonly } from 'vue';

/**
 * Composable for accessing Leaflet map instance and utilities
 * To be used within child components of the Widget
 */
export function useLeaflet() {
	// Inject map and Leaflet from parent
	const map = inject('leafletMap', null);
	const L = inject('leaflet', null);
	const layers = inject('leafletLayers', null);

	// Check if map is available
	const isReady = computed(() => !!map?.value);

	// Readonly access to map
	const mapInstance = readonly(map);

	// Utility methods
	const whenReady = (callback) => {
		if (map?.value) {
			callback(map.value);
		} else {
			// Wait for map to be ready
			const unwatch = watch(map, (newMap) => {
				if (newMap) {
					unwatch();
					callback(newMap);
				}
			}, { immediate: true });
		}
	};

	// Add layer to map
	const addToMap = (layer) => {
		if (map?.value && layer) {
			layer.addTo(map.value);
			return true;
		}
		return false;
	};

	// Remove layer from map
	const removeFromMap = (layer) => {
		if (map?.value && layer) {
			map.value.removeLayer(layer);
			return true;
		}
		return false;
	};

	// Fit bounds
	const fitBounds = (bounds, options) => {
		if (map?.value && bounds) {
			map.value.fitBounds(bounds, options);
		}
	};

	// Fly to location
	const flyTo = (latlng, zoom, options) => {
		if (map?.value) {
			map.value.flyTo(latlng, zoom, options);
		}
	};

	// Pan to location
	const panTo = (latlng, options) => {
		if (map?.value) {
			map.value.panTo(latlng, options);
		}
	};

	// Get current center
	const getCenter = () => {
		return map?.value ? map.value.getCenter() : null;
	};

	// Get current zoom
	const getZoom = () => {
		return map?.value ? map.value.getZoom() : null;
	};

	// Get bounds
	const getBounds = () => {
		return map?.value ? map.value.getBounds() : null;
	};

	// Register layer with id
	const registerLayer = (id, layer) => {
		if (layers?.value) {
			layers.value.set(id, layer);
		}
	};

	// Unregister layer
	const unregisterLayer = (id) => {
		if (layers?.value) {
			layers.value.delete(id);
		}
	};

	// Get registered layer
	const getLayer = (id) => {
		return layers?.value?.get(id) || null;
	};

	// Create Leaflet objects using injected L
	const createMarker = (latlng, options) => {
		return L?.marker(latlng, options) || null;
	};

	const createCircle = (latlng, radius, options) => {
		return L?.circle(latlng, radius, options) || null;
	};

	const createPolygon = (latlngs, options) => {
		return L?.polygon(latlngs, options) || null;
	};

	const createPolyline = (latlngs, options) => {
		return L?.polyline(latlngs, options) || null;
	};

	const createRectangle = (bounds, options) => {
		return L?.rectangle(bounds, options) || null;
	};

	const createCircleMarker = (latlng, options) => {
		return L?.circleMarker(latlng, options) || null;
	};

	const createGeoJSON = (data, options) => {
		return L?.geoJSON(data, options) || null;
	};

	const createWMS = (url, options) => {
		return L?.tileLayer.wms(url, options) || null;
	};

	const createTileLayer = (url, options) => {
		return L?.tileLayer(url, options) || null;
	};

	const createLayerGroup = (layers) => {
		return L?.layerGroup(layers) || null;
	};

	const createFeatureGroup = (layers) => {
		return L?.featureGroup(layers) || null;
	};

	return {
		// Core
		map: mapInstance,
		L,
		isReady,
		whenReady,

		// Map operations
		addToMap,
		removeFromMap,
		fitBounds,
		flyTo,
		panTo,
		getCenter,
		getZoom,
		getBounds,

		// Layer registry
		registerLayer,
		unregisterLayer,
		getLayer,

		// Factory methods for creating Leaflet objects
		createMarker,
		createCircle,
		createPolygon,
		createPolyline,
		createRectangle,
		createCircleMarker,
		createGeoJSON,
		createWMS,
		createTileLayer,
		createLayerGroup,
		createFeatureGroup,
	};
}

export default useLeaflet;
