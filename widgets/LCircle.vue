<template>
	<div v-if="false">
		<!-- LCircle is a renderless component -->
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
	latlng: {
		type: Array,
		required: true,
		validator: (val) => val.length >= 2 && typeof val[0] === 'number' && typeof val[1] === 'number',
	},
	radius: {
		type: Number,
		default: 100,
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
		default: null,
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
			'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
			'contextmenu', 'add', 'remove', 'popupopen', 'popupclose',
			'tooltipopen', 'tooltipclose'
		],
	},
});

const emit = defineEmits([
	'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
	'contextmenu', 'add', 'remove', 'popupopen', 'popupclose',
	'tooltipopen', 'tooltipclose', 'ready'
]);

const { addToMap, removeFromMap, createCircle } = useLeaflet();

let circle = null;

const createOptions = () => {
	const opts = { ...props.options };
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
	if (!circle || !props.popup) return;
	if (typeof props.popup === 'string') {
		circle.bindPopup(props.popup);
	} else if (props.popup instanceof HTMLElement) {
		circle.bindPopup(props.popup);
	} else if (typeof props.popup === 'object') {
		const { content, options } = props.popup;
		circle.bindPopup(content, options);
	}
};

const bindTooltip = () => {
	if (!circle || !props.tooltip) return;
	if (typeof props.tooltip === 'string') {
		circle.bindTooltip(props.tooltip);
	} else if (props.tooltip instanceof HTMLElement) {
		circle.bindTooltip(props.tooltip);
	} else if (typeof props.tooltip === 'object') {
		const { content, options } = props.tooltip;
		circle.bindTooltip(content, options);
	}
};

const bindEvents = () => {
	if (!circle) return;
	props.events.forEach((eventName) => {
		circle.on(eventName, (e) => emit(eventName, e));
	});
};

const unbindEvents = () => {
	if (!circle) return;
	props.events.forEach((eventName) => circle.off(eventName));
};

const initCircle = () => {
	if (!createCircle) return;
	const opts = createOptions();
	circle = createCircle(props.latlng, props.radius, opts);
	if (circle) {
		bindEvents();
		addToMap(circle);
		bindPopup();
		bindTooltip();
		emit('ready', circle);
	}
};

const destroyCircle = () => {
	if (circle) {
		unbindEvents();
		removeFromMap(circle);
		circle = null;
	}
};

watch(() => props.latlng, (newLatLng) => {
	if (circle && newLatLng) circle.setLatLng(newLatLng);
}, { deep: true });

watch(() => props.radius, (newRadius) => {
	if (circle && newRadius !== undefined) circle.setRadius(newRadius);
});

watch([() => props.color, () => props.weight, () => props.opacity, () => props.fillColor, () => props.fillOpacity], () => {
	if (circle) {
		const opts = createOptions();
		circle.setStyle(opts);
	}
});

onMounted(() => initCircle());
onUnmounted(() => destroyCircle());
</script>

<style scoped>
/* LCircle is renderless */
</style>
