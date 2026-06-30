<template>
  <div v-if="false">
    <!-- LPopup is a renderless component -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, inject, ref } from 'vue';
import { useLeaflet } from '../plugins/useLeaflet.js';

const props = defineProps({
  content: {
    type: [String, HTMLElement, Function],
    default: '',
  },
  latlng: {
    type: Array,
    default: null,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  maxWidth: {
    type: Number,
    default: 300,
  },
  minWidth: {
    type: Number,
    default: 50,
  },
  maxHeight: {
    type: Number,
    default: null,
  },
  autoPan: {
    type: Boolean,
    default: true,
  },
  autoPanPaddingTopLeft: {
    type: [Object, Array],
    default: null,
  },
  autoPanPaddingBottomRight: {
    type: [Object, Array],
    default: null,
  },
  autoPanPadding: {
    type: [Object, Array],
    default: null,
  },
  keepInView: {
    type: Boolean,
    default: false,
  },
  closeButton: {
    type: Boolean,
    default: true,
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
  closeOnEscapeKey: {
    type: Boolean,
    default: true,
  },
  closeOnClick: {
    type: [Boolean, String],
    default: null,
  },
  className: {
    type: String,
    default: '',
  },
  offset: {
    type: [Array, Object],
    default: () => [0, 7],
  },
  open: {
    type: Boolean,
    default: true,
  },
  target: {
    type: Object,
    default: null,
  },
  events: {
    type: Array,
    default: () => ['add', 'remove', 'popupopen', 'popupclose'],
  },
});

const emit = defineEmits(['add', 'remove', 'popupopen', 'popupclose', 'ready']);

const { L } = useLeaflet();
const leafletMap = inject('leafletMap', null);

let popup = null;
let boundTarget = null;

const createOptions = () => {
  const opts = { ...props.options };
  if (props.maxWidth !== 300) opts.maxWidth = props.maxWidth;
  if (props.minWidth !== 50) opts.minWidth = props.minWidth;
  if (props.maxHeight !== null) opts.maxHeight = props.maxHeight;
  if (props.autoPan !== true) opts.autoPan = props.autoPan;
  if (props.autoPanPaddingTopLeft !== null) opts.autoPanPaddingTopLeft = props.autoPanPaddingTopLeft;
  if (props.autoPanPaddingBottomRight !== null) opts.autoPanPaddingBottomRight = props.autoPanPaddingBottomRight;
  if (props.autoPanPadding !== null) opts.autoPanPadding = props.autoPanPadding;
  if (props.keepInView !== false) opts.keepInView = props.keepInView;
  if (props.closeButton !== true) opts.closeButton = props.closeButton;
  if (props.autoClose !== true) opts.autoClose = props.autoClose;
  if (props.closeOnEscapeKey !== true) opts.closeOnEscapeKey = props.closeOnEscapeKey;
  if (props.closeOnClick !== null) opts.closeOnClick = props.closeOnClick;
  if (props.className !== '') opts.className = props.className;
  if (JSON.stringify(props.offset) !== JSON.stringify([0, 7])) opts.offset = props.offset;
  return opts;
};

const bindEvents = () => {
  if (!popup) return;
  props.events.forEach((eventName) => {
    popup.on(eventName, (e) => emit(eventName, e));
  });
};

const unbindEvents = () => {
  if (!popup) return;
  props.events.forEach((eventName) => popup.off(eventName));
};

const openPopup = () => {
  if (!popup || !leafletMap?.value) return;

  if (props.target) {
    // Bind to a specific target layer
    popup.setContent(props.content);
    boundTarget = props.target;
    boundTarget.bindPopup(popup);
    if (props.open) boundTarget.openPopup();
  } else if (props.latlng) {
    // Open at specific latlng
    popup.setLatLng(props.latlng).setContent(props.content).openOn(leafletMap.value);
  } else {
    // Open at map center
    popup.setContent(props.content).openOn(leafletMap.value);
  }
};

const closePopup = () => {
  if (!popup) return;
  if (boundTarget) {
    boundTarget.closePopup();
  } else {
    popup.remove();
  }
};

const initPopup = () => {
  if (!L) return;

  const opts = createOptions();
  popup = L.popup(opts);

  if (popup) {
    bindEvents();
    if (props.open) {
      openPopup();
    }
    emit('ready', popup);
  }
};

const destroyPopup = () => {
  if (popup) {
    closePopup();
    unbindEvents();
    if (boundTarget) {
      boundTarget.unbindPopup();
      boundTarget = null;
    }
    popup = null;
  }
};

watch(() => props.content, (newContent) => {
  if (popup && newContent !== undefined) {
    popup.setContent(newContent);
  }
});

watch(() => props.latlng, (newLatLng) => {
  if (popup && newLatLng) {
    popup.setLatLng(newLatLng);
  }
}, { deep: true });

watch(() => props.open, (shouldOpen) => {
  if (shouldOpen) {
    openPopup();
  } else {
    closePopup();
  }
});

watch(() => props.target, (newTarget) => {
  if (boundTarget) {
    boundTarget.unbindPopup();
    boundTarget = null;
  }
  if (newTarget && popup) {
    boundTarget = newTarget;
    boundTarget.bindPopup(popup);
    if (props.open) boundTarget.openPopup();
  }
});

onMounted(() => initPopup());
onUnmounted(() => destroyPopup());
</script>

<style scoped>
/* LPopup is renderless */
</style>
