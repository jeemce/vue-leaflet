<template>
	<div v-if="false">
		<!-- LWMS is a renderless component -->
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, computed, ref } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
	url: {
		type: String,
		required: true,
	},
	layers: {
		type: String,
		default: '',
	},
	styles: {
		type: String,
		default: '',
	},
	format: {
		type: String,
		default: 'image/png',
	},
	transparent: {
		type: Boolean,
		default: true,
	},
	version: {
		type: String,
		default: '1.1.1',
	},
	crs: {
		type: Object,
		default: null,
	},
	uppercase: {
		type: Boolean,
		default: false,
	},
	opacity: {
		type: Number,
		default: 1.0,
	},
	zIndex: {
		type: Number,
		default: 1,
	},
	visible: {
		type: Boolean,
		default: true,
	},
	options: {
		type: Object,
		default: () => ({}),
	},
	events: {
		type: Array,
		default: () => ['loading', 'load', 'tileerror', 'add', 'remove'],
	},
});

const emit = defineEmits([
	'loading',
	'load',
	'tileerror',
	'add',
	'remove',
	'ready',
	'update:visible',
	'update:opacity',
]);

const { addToMap, removeFromMap, createWMS, map } = useLeaflet();

let wmsLayer = null;
const isVisible = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val),
});

const createOptions = () => {
	const opts = {
		...props.options,
		layers: props.layers,
		styles: props.styles,
		format: props.format,
		transparent: props.transparent,
		version: props.version,
		uppercase: props.uppercase,
		opacity: props.opacity,
	};

	if (props.crs) {
		opts.crs = props.crs;
	}

	return opts;
};

const bindEvents = () => {
	if (!wmsLayer) return;

	props.events.forEach((eventName) => {
		wmsLayer.on(eventName, (e) => {
			emit(eventName, e);
		});
	});
};

const unbindEvents = () => {
	if (!wmsLayer) return;

	props.events.forEach((eventName) => {
		wmsLayer.off(eventName);
	});
};

const initWMS = () => {
	if (!createWMS || !props.visible) return;

	const opts = createOptions();
	wmsLayer = createWMS(props.url, opts);

	if (wmsLayer) {
		bindEvents();
		addToMap(wmsLayer);

		// Set zIndex if specified
		if (props.zIndex !== 1) {
			wmsLayer.setZIndex(props.zIndex);
		}

		emit('ready', wmsLayer);
	}
};

const destroyWMS = () => {
	if (wmsLayer) {
		unbindEvents();
		removeFromMap(wmsLayer);
		wmsLayer = null;
	}
};

// Watch for URL changes
watch(
	() => props.url,
	(newUrl) => {
		if (wmsLayer && newUrl) {
			destroyWMS();
			nextTick(() => {
				initWMS();
			});
		}
	}
);

// Watch for layers changes
watch(
	() => props.layers,
	(newLayers) => {
		if (wmsLayer && newLayers !== undefined) {
			wmsLayer.setParams({ layers: newLayers });
		}
	}
);

// Watch for styles changes
watch(
	() => props.styles,
	(newStyles) => {
		if (wmsLayer && newStyles !== undefined) {
			wmsLayer.setParams({ styles: newStyles });
		}
	}
);

// Watch for opacity changes
watch(
	() => props.opacity,
	(newOpacity) => {
		if (wmsLayer && typeof newOpacity === 'number') {
			wmsLayer.setOpacity(newOpacity);
		}
	}
);

// Watch for zIndex changes
watch(
	() => props.zIndex,
	(newZIndex) => {
		if (wmsLayer && typeof newZIndex === 'number') {
			wmsLayer.setZIndex(newZIndex);
		}
	}
);

// Watch for visibility changes
watch(
	() => props.visible,
	(newVisible) => {
		if (newVisible && !wmsLayer) {
			initWMS();
		} else if (!newVisible && wmsLayer) {
			destroyWMS();
		}
	}
);

// Lifecycle hooks
onMounted(() => {
	initWMS();
});

onUnmounted(() => {
	destroyWMS();
});
</script>

<style scoped>
/* LWMS is renderless */
</style>
