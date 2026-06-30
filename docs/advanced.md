# Advanced Usage

## Lifecycle Hooks

Widget `leaflet.vue` menyediakan lifecycle hooks untuk integrasi yang fleksibel:

### Props-based Hooks

```vue
<template>
	<Widget
		:center="center"
		:zoom="zoom"
		:onMapCreated="handleMapCreated"
		:onMapMounted="handleMapMounted"
		:onLayerAdded="handleLayerAdded"
	/>
</template>

<script setup>
import Widget from 'vue-leaflet/widgets/leaflet.vue';

const center = ref([51.505, -0.09]);
const zoom = ref(13);

const handleMapCreated = ({ container, config }) => {
	console.log('Map container created:', container);
	console.log('Configuration:', config);
};

const handleMapMounted = (map) => {
	console.log('Map instance mounted:', map);
	// Lakukan kustomisasi tambahan di sini
};

const handleLayerAdded = ({ type, layer, config }) => {
	console.log(`Layer added - type: ${type}`, layer, config);
};
</script>
```

### Event-based Hooks

```vue
<template>
	<Widget
		:center="center"
		:zoom="zoom"
		@map-created="onMapCreated"
		@map-mounted="onMapMounted"
		@map-ready="onMapReady"
		@map-destroyed="onMapDestroyed"
		@layer-add="onLayerAdd"
		@layer-remove="onLayerRemove"
	/>
</template>

<script setup>
const onMapCreated = ({ container, config }) => {
	console.log('Map created event');
};

const onMapMounted = (map) => {
	console.log('Map mounted event');
};

const onMapReady = (map) => {
	console.log('Map ready event - fully initialized');
};

const onMapDestroyed = (map) => {
	console.log('Map destroyed event');
};

const onLayerAdd = (event) => {
	console.log('Layer added:', event);
};

const onLayerRemove = (event) => {
	console.log('Layer removed:', event);
};
</script>
```

## Composable useLeaflet

`useLeaflet()` menyediakan akses ke map instance, Leaflet, dan utility methods:

### Basic Usage

```vue
<script setup>
import { useLeaflet } from 'vue-leaflet/composables/useLeaflet.js';

const {
	// Core
	map,
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

	// Factory methods
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
} = useLeaflet();

// Wait for map to be ready
whenReady((mapInstance) => {
	console.log('Map is ready:', mapInstance);

	// Create a marker manually
	const marker = createMarker([51.5, -0.09], { draggable: true });
	addToMap(marker);

	// Fly to location
	flyTo([51.5, -0.09], 15, { duration: 2 });
});
</script>
```

### Creating Custom Layers

```vue
<script setup>
import { onMounted } from 'vue';
import { useLeaflet } from 'vue-leaflet/composables/useLeaflet.js';

const { whenReady, createPolygon, createCircle, addToMap, createWMS } = useLeaflet();

onMounted(() => {
	whenReady(() => {
		// Create a polygon
		const polygon = createPolygon(
			[
				[51.509, -0.08],
				[51.503, -0.06],
				[51.51, -0.047],
			],
			{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }
		);
		addToMap(polygon);

		// Create a circle
		const circle = createCircle(
			[51.508, -0.11],
			500,
			{ color: 'green', fillColor: '#3f3', fillOpacity: 0.5 }
		);
		addToMap(circle);

		// Add WMS layer
		const wms = createWMS(
			'https://example.com/geoserver/wms',
			{
				layers: 'namespace:layername',
				format: 'image/png',
				transparent: true,
			}
		);
		addToMap(wms);
	});
});
</script>
```

## Child Components

Gunakan child components untuk declarative layer management:

### LMarker

```vue
<template>
	<Widget :center="[51.505, -0.09]" :zoom="13">
		<LMarker
			:latlng="[51.5, -0.09]"
			:draggable="true"
			:opacity="0.8"
			popup="Hello, I'm a marker!"
			@click="onMarkerClick"
			@dragend="onMarkerDrag"
		/>
	</Widget>
</template>

<script setup>
import Widget from 'vue-leaflet/widgets/leaflet.vue';
import LMarker from 'vue-leaflet/widgets/LMarker.vue';

const onMarkerClick = (e) => {
	console.log('Marker clicked:', e);
};

const onMarkerDrag = (e) => {
	console.log('Marker dragged to:', e.target.getLatLng());
};
</script>
```

### LPolygon & LPolyline

```vue
<template>
	<Widget :center="[51.505, -0.09]" :zoom="13">
		<!-- Polygon -->
		<LPolygon
			:latlngs="[
				[51.509, -0.08],
				[51.503, -0.06],
				[51.51, -0.047],
			]"
			color="red"
			:fill-opacity="0.5"
			fill-color="#f03"
			tooltip="I'm a polygon"
		/>

		<!-- Polyline -->
		<LPolyline
			:latlngs="[
				[51.505, -0.09],
				[51.51, -0.1],
				[51.52, -0.08],
			]"
			color="blue"
			:weight="5"
			dash-array="10, 10"
		/>
	</Widget>
</template>

<script setup>
import Widget from 'vue-leaflet/widgets/leaflet.vue';
import LPolygon from 'vue-leaflet/widgets/LPolygon.vue';
import LPolyline from 'vue-leaflet/widgets/LPolyline.vue';
</script>
```

### LWMS (Web Map Service)

```vue
<template>
	<Widget :center="[51.505, -0.09]" :zoom="13">
		<!-- Base OSM layer -->
		<LWMS
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			:options="{ attribution: '&copy; OpenStreetMap contributors' }"
		/>

		<!-- WMS Overlay -->
		<LWMS
			url="https://example.com/geoserver/wms"
			layers="namespace:layername"
			format="image/png"
			:transparent="true"
			version="1.1.1"
			:opacity="0.7"
			:z-index="10"
			@load="onWMSLoad"
			@tileerror="onWMSError"
		/>
	</Widget>
</template>

<script setup>
import Widget from 'vue-leaflet/widgets/leaflet.vue';
import LWMS from 'vue-leaflet/widgets/LWMS.vue';

const onWMSLoad = () => {
	console.log('WMS layer loaded');
};

const onWMSError = (error) => {
	console.error('WMS tile error:', error);
};
</script>
```

## Dynamic Layer Management

```vue
<template>
	<Widget
		ref="mapWidget"
		:center="[51.505, -0.09]"
		:zoom="13"
	>
		<template #default="{ map, leaflet, ready }">
			<!-- Dynamic layers based on state -->
			<LMarker
				v-for="marker in markers"
				:key="marker.id"
				:latlng="marker.latlng"
				:draggable="marker.draggable"
				@click="onMarkerClick(marker)"
			/>

			<LPolygon
				v-for="zone in zones"
				:key="zone.id"
				:latlngs="zone.boundary"
				:color="zone.color"
				:fill-opacity="0.3"
			/>
		</template>
	</Widget>

	<button @click="addRandomMarker">Add Random Marker</button>
	<button @click="clearMarkers">Clear Markers</button>
</template>

<script setup>
import { ref } from 'vue';
import Widget from 'vue-leaflet/widgets/leaflet.vue';
import LMarker from 'vue-leaflet/widgets/LMarker.vue';
import LPolygon from 'vue-leaflet/widgets/LPolygon.vue';

const mapWidget = ref(null);
const markers = ref([]);
const zones = ref([
	{
		id: 1,
		boundary: [[51.509, -0.08], [51.503, -0.06], [51.51, -0.047]],
		color: 'red',
	},
]);

let markerId = 0;

const addRandomMarker = () => {
	const lat = 51.5 + (Math.random() - 0.5) * 0.1;
	const lng = -0.09 + (Math.random() - 0.5) * 0.1;

	markers.value.push({
		id: ++markerId,
		latlng: [lat, lng],
		draggable: true,
	});
};

const clearMarkers = () => {
	markers.value = [];
};

const onMarkerClick = (marker) => {
	console.log('Marker clicked:', marker);
};
</script>
```

## API Reference

### Widget Events

| Event | Payload | Description |
|-------|---------|-------------|
| `map-created` | `{ container, config }` | Map container initialized |
| `map-mounted` | `L.Map` | Map instance created |
| `map-ready` | `L.Map` | Map fully initialized |
| `map-destroyed` | `L.Map` | Map removed |
| `layer-add` | `{ type, layer, id }` | Layer added to map |
| `layer-remove` | `{ layer, id }` | Layer removed from map |

### useLeaflet API

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `map` | `Ref<L.Map>` | Map instance (readonly) |
| `L` | `typeof Leaflet` | Leaflet namespace |
| `isReady` | `ComputedRef<boolean>` | Map ready state |
| `whenReady(callback)` | `Function` | Execute when map ready |
| `addToMap(layer)` | `Function` | Add layer to map |
| `removeFromMap(layer)` | `Function` | Remove layer from map |
| `createMarker(...)` | `Function` | Factory for markers |
| `createPolygon(...)` | `Function` | Factory for polygons |
| `createWMS(...)` | `Function` | Factory for WMS layer |
