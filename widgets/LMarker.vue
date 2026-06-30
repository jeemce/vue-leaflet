<template>
	<div v-if="false">
		<!-- LMarker is a renderless component -->
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
	latlng: {
		type: Array,
		required: true,
		validator: (val) => val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number',
	},
	options: {
		type: Object,
		default: () => ({}),
	},
	icon: {
		type: Object,
		default: null,
	},
	draggable: {
		type: Boolean,
		default: false,
	},
	zIndexOffset: {
		type: Number,
		default: 0,
	},
	opacity: {
		type: Number,
		default: 1.0,
	},
	events: {
		type: Array,
		default: () => ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'dragstart', 'drag', 'dragend', 'move', 'moveend'],
	},
});

const emit = defineEmits([
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'dragstart',
	'drag',
	'dragend',
	'move',
	'moveend',
	'popupopen',
	'popupclose',
	'tooltipopen',
	'tooltipclose',
	'ready',
]);

const { addToMap, removeFromMap, createMarker } = useLeaflet();

let marker = null;

const createOptions = () => {
	const opts = { ...props.options };

	if (props.icon) {
		opts.icon = props.icon;
	}

	if (props.draggable) {
		opts.draggable = true;
	}

	if (props.zIndexOffset !== 0) {
		opts.zIndexOffset = props.zIndexOffset;
	}

	if (props.opacity !== 1.0) {
		opts.opacity = props.opacity;
	}

	return opts;
};

const bindEvents = () => {
	if (!marker) return;

	props.events.forEach((eventName) => {
		marker.on(eventName, (e) => {
			emit(eventName, e);
		});
	});
};

const unbindEvents = () => {
	if (!marker) return;

	props.events.forEach((eventName) => {
		marker.off(eventName);
	});
};

const initMarker = () => {
	if (!createMarker) return;

	const opts = createOptions();
	marker = createMarker(props.latlng, opts);

	if (marker) {
		bindEvents();
		addToMap(marker);
		emit('ready', marker);
	}
};

const destroyMarker = () => {
	if (marker) {
		unbindEvents();
		removeFromMap(marker);
		marker = null;
	}
};

// Watch for latlng changes
watch(
	() => props.latlng,
	(newLatLng) => {
		if (marker && newLatLng) {
			marker.setLatLng(newLatLng);
		}
	},
	{ deep: true }
);

// Watch for options changes
watch(
	() => props.options,
	(newOptions) => {
		if (marker && newOptions) {
			// Re-initialize marker with new options
			destroyMarker();
			nextTick(() => {
				initMarker();
			});
		}
	},
	{ deep: true }
);

// Watch for draggable changes
watch(
	() => props.draggable,
	(newDraggable) => {
		if (marker) {
			if (newDraggable) {
				marker.dragging?.enable();
			} else {
				marker.dragging?.disable();
			}
		}
	}
);

// Watch for opacity changes
watch(
	() => props.opacity,
	(newOpacity) => {
		if (marker && typeof newOpacity === 'number') {
			marker.setOpacity(newOpacity);
		}
	}
);

// Watch for zIndexOffset changes
watch(
	() => props.zIndexOffset,
	(newZIndex) => {
		if (marker && typeof newZIndex === 'number') {
			marker.setZIndexOffset(newZIndex);
		}
	}
);

// Lifecycle hooks
onMounted(() => {
	initMarker();
});

onUnmounted(() => {
	destroyMarker();
});
</script>

<style scoped>
/* LMarker is renderless */
</style>
