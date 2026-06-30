<template>
	<div v-if="false">
		<!-- LRectangle is a renderless component -->
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
	bounds: {
		type: Array,
		required: true,
		validator: (val) => Array.isArray(val) && val.length === 2,
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

const { addToMap, removeFromMap, createRectangle } = useLeaflet();

let rectangle = null;

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
	if (!rectangle || !props.popup) return;
	if (typeof props.popup === 'string') {
		rectangle.bindPopup(props.popup);
	} else if (props.popup instanceof HTMLElement) {
		rectangle.bindPopup(props.popup);
	} else if (typeof props.popup === 'object') {
		const { content, options } = props.popup;
		rectangle.bindPopup(content, options);
	}
};

const bindTooltip = () => {
	if (!rectangle || !props.tooltip) return;
	if (typeof props.tooltip === 'string') {
		rectangle.bindTooltip(props.tooltip);
	} else if (props.tooltip instanceof HTMLElement) {
		rectangle.bindTooltip(props.tooltip);
	} else if (typeof props.tooltip === 'object') {
		const { content, options } = props.tooltip;
		rectangle.bindTooltip(content, options);
	}
};

const bindEvents = () => {
	if (!rectangle) return;
	props.events.forEach((eventName) => {
		rectangle.on(eventName, (e) => emit(eventName, e));
	});
};

const unbindEvents = () => {
	if (!rectangle) return;
	props.events.forEach((eventName) => rectangle.off(eventName));
};

const initRectangle = () => {
	if (!createRectangle) return;
	const opts = createOptions();
	rectangle = createRectangle(props.bounds, opts);
	if (rectangle) {
		bindEvents();
		addToMap(rectangle);
		bindPopup();
		bindTooltip();
		emit('ready', rectangle);
	}
};

const destroyRectangle = () => {
	if (rectangle) {
		unbindEvents();
		removeFromMap(rectangle);
		rectangle = null;
	}
};

watch(() => props.bounds, (newBounds) => {
	if (rectangle && newBounds) rectangle.setBounds(newBounds);
}, { deep: true });

watch([() => props.color, () => props.weight, () => props.opacity, () => props.fillColor, () => props.fillOpacity], () => {
	if (rectangle) {
		const opts = createOptions();
		rectangle.setStyle(opts);
	}
});

onMounted(() => initRectangle());
onUnmounted(() => destroyRectangle());
</script>

<style scoped>
/* LRectangle is renderless */
</style>
