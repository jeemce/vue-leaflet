# Vue Leaflet

Vue SFC wrapper for Leaflet library with JSON/JS Object configuration support.

## Installation

```bash
npm install vue-leaflet
```

## Usage

### Basic Example

```vue
<template>
	<Widget
		:center="[51.505, -0.09]"
		:zoom="13"
		@map-ready="onMapReady"
	/>
</template>

<script setup>
import Widget from 'vue-leaflet/widgets/leaflet.vue';

const onMapReady = (map) => {
	console.log('Map is ready:', map);
};
</script>
```

### Configuration via JSON

```vue
<template>
	<Widget :config="mapConfig" />
</template>

<script setup>
import { ref } from 'vue';
import Widget from 'vue-leaflet/widgets/leaflet.vue';
import defaultConfig from 'vue-leaflet/plugins/default.json';

const mapConfig = ref({
	...defaultConfig.map,
	zoomControl: false,
	center: [51.505, -0.09],
	zoom: 15
});
</script>
```

### Custom Tile Layer

```vue
<template>
	<Widget
		:center="[51.505, -0.09]"
		:zoom="13"
		tile-url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		:tile-options="tileOptions"
	/>
</template>

<script setup>
import { ref } from 'vue';
import Widget from 'vue-leaflet/widgets/leaflet.vue';

const tileOptions = ref({
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 19
});
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | Array | `[0, 0]` | Map center coordinates `[lat, lng]` |
| `zoom` | Number | `13` | Initial zoom level |
| `config` | Object | `{}` | Map configuration options |
| `style` | Object | `{}` | Custom CSS styles for the container |
| `tileUrl` | String | OSM URL | Tile layer URL template |
| `tileOptions` | Object | See below | Tile layer options |

### Default Tile Options

```js
{
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 19
}
```

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| `map-ready` | Emitted when map is initialized | `map` instance |
| `update:center` | Emitted when center changes | `[lat, lng]` array |
| `update:zoom` | Emitted when zoom changes | `zoom` number |
| `move` | Map move event | Leaflet event object |
| `zoom` | Zoom change event | Leaflet event object |
| `click` | Click event | Leaflet event object |
| `dblclick` | Double click event | Leaflet event object |
| `mousedown` | Mouse down event | Leaflet event object |
| `mouseup` | Mouse up event | Leaflet event object |
| `mouseover` | Mouse over event | Leaflet event object |
| `mouseout` | Mouse out event | Leaflet event object |

## Methods

Access methods via component reference:

```vue
<template>
	<Widget ref="mapWidget" :center="center" :zoom="zoom" />
	<button @click="changeTileLayer">Change Tile Layer</button>
</template>

<script setup>
import { ref } from 'vue';
import Widget from 'vue-leaflet/widgets/leaflet.vue';

const mapWidget = ref(null);
const center = ref([51.505, -0.09]);
const zoom = ref(13);

const changeTileLayer = () => {
	// Access exposed methods
	const map = mapWidget.value?.getMap();
	const tileLayer = mapWidget.value?.getTileLayer();
	
	// Or use the built-in method
	mapWidget.value?.setTileUrl(
		'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{ attribution: 'New Attribution' }
	);
};
</script>
```

### Exposed Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getMap()` | Get Leaflet map instance | `L.Map` instance |
| `getTileLayer()` | Get current tile layer | `L.TileLayer` instance |
| `setTileUrl(url, options)` | Change tile layer URL | `void` |

## Default Configuration

The default configuration is stored in `./plugins/default.json`:

```json
{
	"map": {
		"center": [0, 0],
		"zoom": 13,
		"zoomControl": true,
		"attributionControl": true,
		"scrollWheelZoom": true,
		"doubleClickZoom": true,
		"boxZoom": true,
		"keyboard": true,
		"dragging": true
	},
	"tileLayer": {
		"url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		"options": {
			"attribution": "&copy; OpenStreetMap contributors",
			"maxZoom": 19
		}
	}
}
```

## Leaflet Resources

- [Leaflet Reference](https://leafletjs.com/reference.html)
- [Leaflet Plugins](https://leafletjs.com/plugins.html)
