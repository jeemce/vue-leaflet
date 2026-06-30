<template>
  <div v-if="false">
    <!-- LFeatureGroup is a renderless component -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  layers: {
    type: Array,
    default: () => [],
  },
  visible: {
    type: Boolean,
    default: true,
  },
  events: {
    type: Array,
    default: () => [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
      'contextmenu', 'add', 'remove', 'layeradd', 'layerremove'
    ],
  },
});

const emit = defineEmits([
  'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
  'contextmenu', 'add', 'remove', 'layeradd', 'layerremove', 'ready'
]);

const { addToMap, removeFromMap, createFeatureGroup } = useLeaflet();

let featureGroup = null;

const bindEvents = () => {
  if (!featureGroup) return;
  props.events.forEach((eventName) => {
    featureGroup.on(eventName, (e) => emit(eventName, e));
  });
};

const unbindEvents = () => {
  if (!featureGroup) return;
  props.events.forEach((eventName) => featureGroup.off(eventName));
};

const initFeatureGroup = () => {
  if (!createFeatureGroup || !props.visible) return;
  featureGroup = createFeatureGroup(props.layers, props.options);
  if (featureGroup) {
    bindEvents();
    addToMap(featureGroup);
    emit('ready', featureGroup);
  }
};

const destroyFeatureGroup = () => {
  if (featureGroup) {
    unbindEvents();
    removeFromMap(featureGroup);
    featureGroup = null;
  }
};

watch(() => props.layers, (newLayers) => {
  if (featureGroup && newLayers) {
    destroyFeatureGroup();
    initFeatureGroup();
  }
}, { deep: true });

watch(() => props.visible, (newVisible) => {
  if (newVisible && !featureGroup) initFeatureGroup();
  else if (!newVisible && featureGroup) destroyFeatureGroup();
});

onMounted(() => initFeatureGroup());
onUnmounted(() => destroyFeatureGroup());
</script>

<style scoped>
/* LFeatureGroup is renderless */
</style>
