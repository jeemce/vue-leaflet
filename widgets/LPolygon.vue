<template>
	<div v-if="false">
		<!-- LPolygon is a renderless component -->
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
	latlngs: {
		type: Array,
		required: true,
		validator: (val) => Array.isArray(val) && val.length > 0,
	},
	options: {
		type: Object,
		default: () => ({}),
	},
	stroke: {
		type: Boolean,
		default: true,
	},
	color: {
		type: String,
		default: '#3388ff',
	},
	weight: {
		type: Number,
		default: 3,
	},
	opacity: {
		type: Number,
		default: 1.0,
	},
	fill: {
		type: Boolean,
		default: true,
	},
	fillColor: {
		type: String,
		default: null, // Uses color by default
	},
	fillOpacity: {
		type: Number,
		default: 0.2,
	},
	dashArray: {
		type: String,
		default: null,
	},
	dashOffset: {
		type: String,
		default: null,
	},
	lineCap: {
		type: String,
		default: 'round',
	},
	lineJoin: {
		type: String,
		default: 'round',
	},
	className: {
		type: String,
		default: '',
	},
	popup: {
		type: [String, HTMLElement, Object],
		default: null,
	},
	tooltip: {
		type: [String, HTMLElement, Object],
		default: null,
	},
	events: {
		type: Array,
		default: () => [
			'click',
			'dblclick',
			'mousedown',
			'mouseup',
			'mouseover',
			'mouseout',
			'contextmenu',
			'add',
			'remove',
			'popupopen',
			'popupclose',
			'tooltipopen',
			'tooltipclose',
		],
	},
});

const emit = defineEmits([
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'contextmenu',
	'add',
	'remove',
	'popupopen',
	'popupclose',
	'tooltipopen',
	'tooltipclose',
	'ready',
	'update:latlngs',
]);

const { addToMap, removeFromMap, createPolygon } = useLeaflet();

let polygon = null;

const createOptions = () => {
	const opts = { ...props.options };

	// Style options
	if (props.stroke !== undefined) opts.stroke = props.stroke;
	if (props.color) opts.color = props.color;
	if (props.weight !== undefined) opts.weight = props.weight;
	if (props.opacity !== undefined) opts.opacity = props.opacity;
	if (props.fill !== undefined) opts.fill = props.fill;
	if (props.fillColor) opts.fillColor = props.fillColor;
	if (props.fillOpacity !== undefined) opts.fillOpacity = props.fillOpacity;
	if (props.dashArray) opts.dashArray = props.dashArray;
	if (props.dashOffset) opts.dashOffset = props.dashOffset;
	if (props.lineCap) opts.lineCap = props.lineCap;
	if (props.lineJoin) opts.lineJoin = props.lineJoin;
	if (props.className) opts.className = props.className;

	return opts;
};

const bindPopup = () => {
	if (!polygon || !props.popup) return;

	if (typeof props.popup === 'string') {
		polygon.bindPopup(props.popup);
	} else if (props.popup instanceof HTMLElement) {
		polygon.bindPopup(props.popup);
	} else if (typeof props.popup === 'object') {
		const { content, options } = props.popup;
		polygon.bindPopup(content, options);
	}
};

const bindTooltip = () => {
	if (!polygon || !props.tooltip) return;

	if (typeof props.tooltip === 'string') {
		polygon.bindTooltip(props.tooltip);
	} else if (props.tooltip instanceof HTMLElement) {
		polygon.bindTooltip(props.tooltip);
	} else if (typeof props.tooltip === 'object') {
		const { content, options } = props.tooltip;
		polygon.bindTooltip(content, options);
	}
};

const bindEvents = () => {
	if (!polygon) return;

	props.events.forEach((eventName) => {
		polygon.on(eventName, (e) => {
			emit(eventName, e);
			if (eventName === 'edit' || eventName === 'move') {
				emit('update:latlngs', polygon.getLatLngs());
			}
		});
	});
};

const unbindEvents = () => {
	if (!polygon) return;

	props.events.forEach((eventName) => {
		polygon.off(eventName);
	});
};

const initPolygon = () => {
	if (!createPolygon) return;

	const opts = createOptions();
	polygon = createPolygon(props.latlngs, opts);

	if (polygon) {
		bindEvents();
		addToMap(polygon);
		bindPopup();
		bindTooltip();
		emit('ready', polygon);
	}
};

const destroyPolygon = () => {
	if (polygon) {
		unbindEvents();
		removeFromMap(polygon);
		polygon = null;
	}
};

// Watch for latlngs changes
watch(
	() => props.latlngs,
	(newLatLngs) => {
		if (polygon && newLatLngs) {
			polygon.setLatLngs(newLatLngs);
		}
	},
	{ deep: true }
);

// Watch for style changes
watch(
	[
		() => props.color,
		() => props.weight,
		() => props.opacity,
		() => props.fillColor,
		() => props.fillOpacity,
		() => props.dashArray,
	],
	() => {
		if (polygon) {
			const opts = createOptions();
			polygon.setStyle(opts);
		}
	}
);

// Lifecycle hooks
onMounted(() => {
	initPolygon();
});

onUnmounted(() => {
	destroyPolygon();
});
</script>

<style scoped>
/* LPolygon is renderless */
</style>
