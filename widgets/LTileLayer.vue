<template>
  <div v-if="false">
    <!-- LTileLayer is a renderless component -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  minZoom: {
    type: Number,
    default: 0,
  },
  maxZoom: {
    type: Number,
    default: 18,
  },
  subdomains: {
    type: [String, Array],
    default: 'abc',
  },
  errorTileUrl: {
    type: String,
    default: '',
  },
  zoomOffset: {
    type: Number,
    default: 0,
  },
  tms: {
    type: Boolean,
    default: false,
  },
  zoomReverse: {
    type: Boolean,
    default: false,
  },
  detectRetina: {
    type: Boolean,
    default: false,
  },
  crossOrigin: {
    type: [Boolean, String],
    default: false,
  },
  referrerPolicy: {
    type: [Boolean, String],
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
  attribution: {
    type: String,
    default: '',
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
]);

const { addToMap, removeFromMap, createTileLayer } = useLeaflet();

let tileLayer = null;

const createOptions = () => {
  const opts = { ...props.options };
  if (props.minZoom !== 0) opts.minZoom = props.minZoom;
  if (props.maxZoom !== 18) opts.maxZoom = props.maxZoom;
  if (props.subdomains !== 'abc') opts.subdomains = props.subdomains;
  if (props.errorTileUrl) opts.errorTileUrl = props.errorTileUrl;
  if (props.zoomOffset !== 0) opts.zoomOffset = props.zoomOffset;
  if (props.tms) opts.tms = props.tms;
  if (props.zoomReverse) opts.zoomReverse = props.zoomReverse;
  if (props.detectRetina) opts.detectRetina = props.detectRetina;
  if (props.crossOrigin !== false) opts.crossOrigin = props.crossOrigin;
  if (props.referrerPolicy !== false) opts.referrerPolicy = props.referrerPolicy;
  if (props.attribution) opts.attribution = props.attribution;
  return opts;
};

const bindEvents = () => {
  if (!tileLayer) return;
  props.events.forEach((eventName) => {
    tileLayer.on(eventName, (e) => emit(eventName, e));
  });
};

const unbindEvents = () => {
  if (!tileLayer) return;
  props.events.forEach((eventName) => tileLayer.off(eventName));
};

const initTileLayer = () => {
  if (!createTileLayer || !props.visible) return;
  const opts = createOptions();
  tileLayer = createTileLayer(props.url, opts);
  if (tileLayer) {
    bindEvents();
    addToMap(tileLayer);
    if (props.zIndex !== 1) tileLayer.setZIndex(props.zIndex);
    if (props.opacity !== 1.0) tileLayer.setOpacity(props.opacity);
    emit('ready', tileLayer);
  }
};

const destroyTileLayer = () => {
  if (tileLayer) {
    unbindEvents();
    removeFromMap(tileLayer);
    tileLayer = null;
  }
};

watch(() => props.url, (newUrl) => {
  if (tileLayer && newUrl) {
    destroyTileLayer();
    nextTick(() => initTileLayer());
  }
});

watch(() => props.opacity, (newOpacity) => {
  if (tileLayer && typeof newOpacity === 'number') tileLayer.setOpacity(newOpacity);
});

watch(() => props.zIndex, (newZIndex) => {
  if (tileLayer && typeof newZIndex === 'number') tileLayer.setZIndex(newZIndex);
});

watch(() => props.visible, (newVisible) => {
  if (newVisible && !tileLayer) initTileLayer();
  else if (!newVisible && tileLayer) destroyTileLayer();
});

onMounted(() => initTileLayer());
onUnmounted(() => destroyTileLayer());
</script>

<style scoped>
/* LTileLayer is renderless */
</style>
