<template>
	<div v-if="false">
		<!-- LPolyline is a renderless component -->
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
	smoothFactor: {
		type: Number,
		default: 1.0,
	},
	noClip: {
		type: Boolean,
		default: false,
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

const { addToMap, removeFromMap, createPolyline } = useLeaflet();

let polyline = null;

const createOptions = () => {
	const opts = { ...props.options };

	if (props.stroke !== undefined) opts.stroke = props.stroke;
	if (props.color) opts.color = props.color;
	if (props.weight !== undefined) opts.weight = props.weight;
	if (props.opacity !== undefined) opts.opacity = props.opacity;
	if (props.dashArray) opts.dashArray = props.dashArray;
	if (props.dashOffset) opts.dashOffset = props.dashOffset;
	if (props.lineCap) opts.lineCap = props.lineCap;
	if (props.lineJoin) opts.lineJoin = props.lineJoin;
	if (props.className) opts.className = props.className;
	if (props.smoothFactor !== undefined) opts.smoothFactor = props.smoothFactor;
	if (props.noClip !== undefined) opts.noClip = props.noClip;

	return opts;
};

const bindPopup = () => {
	if (!polyline || !props.popup) return;

	if (typeof props.popup === 'string') {
		polyline.bindPopup(props.popup);
	} else if (props.popup instanceof HTMLElement) {
		polyline.bindPopup(props.popup);
	} else if (typeof props.popup === 'object') {
		const { content, options } = props.popup;
		polyline.bindPopup(content, options);
	}
};

const bindTooltip = () => {
	if (!polyline || !props.tooltip) return;

	if (typeof props.tooltip === 'string') {
		polyline.bindTooltip(props.tooltip);
	} else if (props.tooltip instanceof HTMLElement) {
		polyline.bindTooltip(props.tooltip);
	} else if (typeof props.tooltip === 'object') {
		const { content, options } = props.tooltip;
		polyline.bindTooltip(content, options);
	}
};

const bindEvents = () => {
	if (!polyline) return;

	props.events.forEach((eventName) => {
		polyline.on(eventName, (e) => {
			emit(eventName, e);
		});
	});
};

const unbindEvents = () => {
	if (!polyline) return;

	props.events.forEach((eventName) => {
		polyline.off(eventName);
	});
};

const initPolyline = () => {
	if (!createPolyline) return;

	const opts = createOptions();
	polyline = createPolyline(props.latlngs, opts);

	if (polyline) {
		bindEvents();
		addToMap(polyline);
		bindPopup();
		bindTooltip();
		emit('ready', polyline);
	}
};

const destroyPolyline = () => {
	if (polyline) {
		unbindEvents();
		removeFromMap(polyline);
		polyline = null;
	}
};

// Watch for latlngs changes
watch(
	() => props.latlngs,
	(newLatLngs) => {
		if (polyline && newLatLngs) {
			polyline.setLatLngs(newLatLngs);
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
		() => props.dashArray,
	],
	() => {
		if (polyline) {
			const opts = createOptions();
			polyline.setStyle(opts);
		}
	}
);

// Lifecycle hooks
onMounted(() => {
	initPolyline();
});

onUnmounted(() => {
	destroyPolyline();
});
</script>

<style scoped>
/* LPolyline is renderless */
</style>
