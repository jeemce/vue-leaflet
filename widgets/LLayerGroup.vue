<template>
  <div v-if="false">
    <!-- LLayerGroup is a renderless component -->
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
    default: () => ['add', 'remove', 'layeradd', 'layerremove'],
  },
});

const emit = defineEmits(['add', 'remove', 'layeradd', 'layerremove', 'ready']);

const { addToMap, removeFromMap, createLayerGroup } = useLeaflet();

let layerGroup = null;

const bindEvents = () => {
  if (!layerGroup) return;
  props.events.forEach((eventName) => {
    layerGroup.on(eventName, (e) => emit(eventName, e));
  });
};

const unbindEvents = () => {
  if (!layerGroup) return;
  props.events.forEach((eventName) => layerGroup.off(eventName));
};

const initLayerGroup = () => {
  if (!createLayerGroup || !props.visible) return;
  layerGroup = createLayerGroup(props.layers, props.options);
  if (layerGroup) {
    bindEvents();
    addToMap(layerGroup);
    emit('ready', layerGroup);
  }
};

const destroyLayerGroup = () => {
  if (layerGroup) {
    unbindEvents();
    removeFromMap(layerGroup);
    layerGroup = null;
  }
};

watch(() => props.layers, (newLayers) => {
  if (layerGroup && newLayers) {
    // Re-initialize with new layers
    destroyLayerGroup();
    initLayerGroup();
  }
}, { deep: true });

watch(() => props.visible, (newVisible) => {
  if (newVisible && !layerGroup) initLayerGroup();
  else if (!newVisible && layerGroup) destroyLayerGroup();
});

onMounted(() => initLayerGroup());
onUnmounted(() => destroyLayerGroup());
</script>

<style scoped>
/* LLayerGroup is renderless */
</style>
