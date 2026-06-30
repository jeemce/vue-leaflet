<template>
	<div ref="mapContainer" class="vue-leaflet-map" :style="containerStyle">
		<!-- Slot for child layers/components -->
		<slot v-if="map" :map="map" :leaflet="L" :ready="isReady" />
	</div>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted,
	onUnmounted,
	watch,
	provide,
	nextTick,
} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Props definition
const props = defineProps({
	// Map configuration
	config: {
		type: Object,
		default: () => ({}),
	},
	// Center coordinates [lat, lng]
	center: {
		type: Array,
		default: () => [0, 0],
	},
	// Zoom level
	zoom: {
		type: Number,
		default: 13,
	},
	// Map style (CSS)
	style: {
		type: Object,
		default: () => ({}),
	},
	// Tile layer URL template
	tileUrl: {
		type: String,
		default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	},
	// Tile layer options
	tileOptions: {
		type: Object,
		default: () => ({
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}),
	},
	// Layers to add on init (raster, vector, overlays)
	layers: {
		type: Array,
		default: () => [],
	},
	// Controls to add
	controls: {
		type: Object,
		default: () => ({}),
	},
	// Lifecycle hooks
	onMapCreated: {
		type: Function,
		default: null,
	},
	onMapMounted: {
		type: Function,
		default: null,
	},
	onLayerAdded: {
		type: Function,
		default: null,
	},
});

// Emits
const emit = defineEmits([
	// Lifecycle events
	'map-created',
	'map-mounted',
	'map-ready',
	'map-destroyed',
	// Update events
	'update:center',
	'update:zoom',
	// Map events
	'move',
	'zoom',
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'layer-add',
	'layer-remove',
	'overlay-add',
	'overlay-remove',
	// Base layer events
	'baselayer-change',
]);

// Refs
const mapContainer = ref(null);
const map = ref(null);
const tileLayer = ref(null);
const isReady = ref(false);
const layerControl = ref(null);
const layersRef = ref(new Map());

// Provide map instance and Leaflet to child components
provide('leafletMap', map);
provide('leaflet', L);
provide('leafletLayers', layersRef);

// Computed styles
const containerStyle = computed(() => ({
	width: '100%',
	minHeight: '400px',
	...props.style,
}));

// Default configuration merged with props
const mergedConfig = computed(() => ({
	zoomControl: true,
	attributionControl: true,
	scrollWheelZoom: true,
	doubleClickZoom: true,
	boxZoom: true,
	keyboard: true,
	dragging: true,
	...props.config,
}));

// Initialize map
const initMap = async () => {
	if (!mapContainer.value) return;

	// Emit created event
	emit('map-created', {
		container: mapContainer.value,
		config: mergedConfig.value,
	});

	// Call user callback if provided
	if (props.onMapCreated) {
		props.onMapCreated({
			container: mapContainer.value,
			config: mergedConfig.value,
		});
	}

	// Create map instance
	map.value = L.map(mapContainer.value, {
		center: props.center,
		zoom: props.zoom,
		...mergedConfig.value,
	});

	// Add base tile layer
	addTileLayer();

	// Add initial layers from props
	await addInitialLayers();

	// Add controls
	addControls();

	// Setup event listeners
	setupEventListeners();

	// Mark as ready
	isReady.value = true;

	// Emit mounted event
	emit('map-mounted', map.value);

	if (props.onMapMounted) {
		props.onMapMounted(map.value);
	}

	// Emit ready event
	nextTick(() => {
		emit('map-ready', map.value);
	});
};

// Add tile layer
const addTileLayer = () => {
	if (!map.value) return;

	tileLayer.value = L.tileLayer(props.tileUrl, props.tileOptions).addTo(
		map.value
	);

	emit('layer-add', { type: 'tile', layer: tileLayer.value });
};

// Add initial layers from props
const addInitialLayers = async () => {
	if (!map.value || !props.layers.length) return;

	const baseLayers = {};
	const overlays = {};

	for (const layerConfig of props.layers) {
		const layer = await createLayer(layerConfig);
		if (layer) {
			layer.addTo(map.value);
			layersRef.value.set(layerConfig.id || generateId(), layer);

			// Emit layer added event
			emit('layer-add', { type: layerConfig.type, layer, config: layerConfig });

			if (props.onLayerAdded) {
				props.onLayerAdded({ type: layerConfig.type, layer, config: layerConfig });
			}

			// Categorize for layer control
			if (layerConfig.baseLayer) {
				baseLayers[layerConfig.name || 'Base'] = layer;
			} else {
				overlays[layerConfig.name || 'Overlay'] = layer;
			}
		}
	}

	// Add layer control if we have multiple layers
	if (Object.keys(baseLayers).length > 0 || Object.keys(overlays).length > 0) {
		layerControl.value = L.control.layers(baseLayers, overlays).addTo(map.value);
	}
};

// Create layer from config
const createLayer = (config) => {
	if (!L || !map.value) return null;

	switch (config.type) {
		// Raster layers
		case 'tile':
			return L.tileLayer(config.url, config.options);
		case 'wms':
			return L.tileLayer.wms(config.url, config.options);
		case 'imageOverlay':
			return L.imageOverlay(config.url, config.bounds, config.options);
		case 'videoOverlay':
			return L.videoOverlay(config.url, config.bounds, config.options);

		// Vector layers
		case 'marker':
			return L.marker(config.latlng, config.options);
		case 'circleMarker':
			return L.circleMarker(config.latlng, config.options);
		case 'circle':
			return L.circle(config.latlng, config.radius, config.options);
		case 'polyline':
			return L.polyline(config.latlngs, config.options);
		case 'polygon':
			return L.polygon(config.latlngs, config.options);
		case 'rectangle':
			return L.rectangle(config.bounds, config.options);
		case 'geoJSON':
			return L.geoJSON(config.data, config.options);

		// Layer groups
		case 'layerGroup':
			return L.layerGroup(config.layers);
		case 'featureGroup':
			return L.featureGroup(config.layers);

		default:
			console.warn(`Unknown layer type: ${config.type}`);
			return null;
	}
};

// Add controls
const addControls = () => {
	if (!map.value) return;

	const controls = props.controls;

	// Zoom control
	if (controls.zoom !== false && mergedConfig.value.zoomControl) {
		const zoomOptions = typeof controls.zoom === 'object' ? controls.zoom : {};
		L.control.zoom(zoomOptions).addTo(map.value);
	}

	// Scale control
	if (controls.scale) {
		const scaleOptions = typeof controls.scale === 'object' ? controls.scale : {};
		L.control.scale(scaleOptions).addTo(map.value);
	}

	// Attribution control (if not using default)
	if (controls.attribution && mergedConfig.value.attributionControl === false) {
		const attrOptions = typeof controls.attribution === 'object' ? controls.attribution : {};
		L.control.attribution(attrOptions).addTo(map.value);
	}
};

// Generate unique ID
const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Setup event listeners
const setupEventListeners = () => {
	if (!map.value) return;

	// Map events
	map.value.on('move', (e) => {
		emit('move', e);
		emit('update:center', [e.target.getCenter().lat, e.target.getCenter().lng]);
	});

	map.value.on('zoom', (e) => {
		emit('zoom', e);
		emit('update:zoom', e.target.getZoom());
	});

	map.value.on('click', (e) => emit('click', e));
	map.value.on('dblclick', (e) => emit('dblclick', e));
	map.value.on('mousedown', (e) => emit('mousedown', e));
	map.value.on('mouseup', (e) => emit('mouseup', e));
	map.value.on('mouseover', (e) => emit('mouseover', e));
	map.value.on('mouseout', (e) => emit('mouseout', e));

	// Layer events
	map.value.on('layeradd', (e) => emit('layer-add', e));
	map.value.on('layerremove', (e) => emit('layer-remove', e));
	map.value.on('baselayerchange', (e) => emit('baselayer-change', e));
	map.value.on('overlayadd', (e) => emit('overlay-add', e));
	map.value.on('overlayremove', (e) => emit('overlay-remove', e));
};

// Watchers for props changes
watch(
	() => props.center,
	(newCenter) => {
		if (map.value && newCenter) {
			map.value.setView(newCenter, map.value.getZoom());
		}
	},
	{ deep: true }
);

watch(
	() => props.zoom,
	(newZoom) => {
		if (map.value && newZoom !== undefined) {
			map.value.setZoom(newZoom);
		}
	}
);

watch(
	() => props.tileUrl,
	(newUrl) => {
		if (map.value && tileLayer.value && newUrl) {
			setTileUrl(newUrl, props.tileOptions);
		}
	}
);

// Watch layers prop for dynamic updates
watch(
	() => props.layers,
	(newLayers, oldLayers) => {
		if (map.value && newLayers !== oldLayers) {
			// Remove existing layers and re-add
			layersRef.value.forEach((layer) => {
				map.value.removeLayer(layer);
			});
			layersRef.value.clear();
			addInitialLayers();
		}
	},
	{ deep: true }
);

// Lifecycle
onMounted(() => {
	initMap();
});

onUnmounted(() => {
	if (map.value) {
		emit('map-destroyed', map.value);
		map.value.remove();
		map.value = null;
		isReady.value = false;
	}
});

// Public methods
const setTileUrl = (url, options = {}) => {
	if (!map.value) return;
	if (tileLayer.value) {
		map.value.removeLayer(tileLayer.value);
	}
	tileLayer.value = L.tileLayer(url, options).addTo(map.value);
	emit('layer-add', { type: 'tile', layer: tileLayer.value });
};

const addLayer = (layerOrConfig) => {
	if (!map.value) return null;

	let layer;
	if (typeof layerOrConfig === 'object' && layerOrConfig.type) {
		layer = createLayer(layerOrConfig);
	} else {
		layer = layerOrConfig;
	}

	if (layer) {
		layer.addTo(map.value);
		const id = layerOrConfig.id || generateId();
		layersRef.value.set(id, layer);
		emit('layer-add', { type: layerOrConfig.type || 'unknown', layer, id });
		return { layer, id };
	}
	return null;
};

const removeLayer = (idOrLayer) => {
	if (!map.value) return false;

	let layer = idOrLayer;
	let id = null;

	if (typeof idOrLayer === 'string') {
		id = idOrLayer;
		layer = layersRef.value.get(id);
	} else {
		// Find id from layer reference
		for (const [key, val] of layersRef.value.entries()) {
			if (val === idOrLayer) {
				id = key;
				break;
			}
		}
	}

	if (layer && map.value.hasLayer(layer)) {
		map.value.removeLayer(layer);
		if (id) layersRef.value.delete(id);
		emit('layer-remove', { layer, id });
		return true;
	}
	return false;
};

const getLayer = (id) => {
	return layersRef.value.get(id) || null;
};

const getAllLayers = () => {
	return new Map(layersRef.value);
};

const fitBounds = (bounds, options) => {
	if (map.value && bounds) {
		map.value.fitBounds(bounds, options);
	}
};

const flyTo = (latlng, zoom, options) => {
	if (map.value) {
		map.value.flyTo(latlng, zoom, options);
	}
};

const invalidateSize = () => {
	if (map.value) {
		map.value.invalidateSize();
	}
};

// Expose map instance and methods for external access
defineExpose({
	// Core
	getMap: () => map.value,
	getLeaflet: () => L,
	getTileLayer: () => tileLayer.value,
	isReady: () => isReady.value,

	// Layer management
	addLayer,
	removeLayer,
	getLayer,
	getAllLayers,
	setTileUrl,

	// Map operations
	fitBounds,
	flyTo,
	invalidateSize,
});
</script>

<style scoped>
.vue-leaflet-map {
	width: 100%;
	min-height: 400px;
}

.vue-leaflet-map :deep(.leaflet-container) {
	width: 100%;
	height: 100%;
	min-height: inherit;
}
</style>
