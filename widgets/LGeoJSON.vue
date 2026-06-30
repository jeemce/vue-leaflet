<template>
  <div v-if="false">
    <!-- LGeoJSON is a renderless component -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
  data: {
    type: [Object, Array],
    required: true,
    validator: (val) => {
      // Allow GeoJSON FeatureCollection, Feature, or Geometry
      return val && (val.type || Array.isArray(val));
    },
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  style: {
    type: [Object, Function],
    default: null,
  },
  filter: {
    type: Function,
    default: null,
  },
  coordsToLatLng: {
    type: Function,
    default: null,
  },
  pointToLayer: {
    type: Function,
    default: null,
  },
  onEachFeature: {
    type: Function,
    default: null,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  events: {
    type: Array,
    default: () => [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
      'contextmenu', 'add', 'remove'
    ],
  },
});

const emit = defineEmits([
  'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
  'contextmenu', 'add', 'remove', 'ready'
]);

const { addToMap, removeFromMap, createGeoJSON } = useLeaflet();

let geoJsonLayer = null;

const bindEvents = () => {
  if (!geoJsonLayer) return;
  props.events.forEach((eventName) => {
    geoJsonLayer.on(eventName, (e) => emit(eventName, e));
  });
};

const unbindEvents = () => {
  if (!geoJsonLayer) return;
  props.events.forEach((eventName) => geoJsonLayer.off(eventName));
};

const initGeoJSON = () => {
  if (!createGeoJSON || !props.visible) return;

  // Build options
  const opts = { ...props.options };

  // Add callbacks if provided
  if (props.style) opts.style = props.style;
  if (props.filter) opts.filter = props.filter;
  if (props.coordsToLatLng) opts.coordsToLatLng = props.coordsToLatLng;
  if (props.pointToLayer) opts.pointToLayer = props.pointToLayer;
  if (props.onEachFeature) opts.onEachFeature = props.onEachFeature;

  geoJsonLayer = createGeoJSON(props.data, opts);

  if (geoJsonLayer) {
    bindEvents();
    addToMap(geoJsonLayer);
    emit('ready', geoJsonLayer);
  }
};

const destroyGeoJSON = () => {
  if (geoJsonLayer) {
    unbindEvents();
    removeFromMap(geoJsonLayer);
    geoJsonLayer = null;
  }
};

watch(() => props.data, (newData) => {
  if (geoJsonLayer && newData) {
    destroyGeoJSON();
    initGeoJSON();
  }
}, { deep: true });

watch(() => props.visible, (newVisible) => {
  if (newVisible && !geoJsonLayer) initGeoJSON();
  else if (!newVisible && geoJsonLayer) destroyGeoJSON();
});

onMounted(() => initGeoJSON());
onUnmounted(() => destroyGeoJSON());
</script>

<style scoped>
/* LGeoJSON is renderless */
</style>
