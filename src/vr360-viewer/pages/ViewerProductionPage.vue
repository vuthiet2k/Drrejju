<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Vr360ViewerLayout from '../layout/Vr360ViewerLayout.vue';
import { createTourServices } from '../services/createTourServices.js';
import { apiBaseURL } from '../../api/http.js';
import { listProjectLocations } from '../../api/locationsApi.js';
import { listPublishedTours } from '../../api/publishedToursApi.js';
import { listProjects } from '../../api/projectsApi.js';
import { getPublicTour } from '../../api/publicApi.js';
import { getVersion, listVersions } from '../../api/toursApi.js';
import { useAuthStore } from '../../stores/authStore.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const viewer = ref(null);
const tour = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const services = createTourServices({ getPublicTour, listPublishedTours, getVersion, listProjects, listProjectLocations, listVersions });
const isPublicMode = computed(() => !auth.isAuthenticated || auth.isGuest);
const options = {
  resolveAssetUrl(url) {
    if (!url || /^(blob:|data:|https?:)/i.test(url)) return url || '';
    return `${apiBaseURL}${url.startsWith('/') ? url : `/${url}`}`;
  },
};

function results(data) {
  return Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];
}

async function loadPublicTour(token) {
  if (token) {
    tour.value = (await services.getPublicTour(token)).data;
    return;
  }
  const catalog = results((await services.listPublishedTours()).data);
  const selected = catalog.find((item) =>
    (!route.query.project || String(item.project_id) === String(route.query.project))
    && (!route.query.location || String(item.location_id) === String(route.query.location))
    && (!route.query.version || String(item.version_id) === String(route.query.version)),
  ) || catalog[0];
  if (!selected?.public_token) throw new Error('No published tour is available.');
  tour.value = (await services.getPublicTour(selected.public_token)).data;
}

async function loadPrivateTour() {
  const projects = results((await services.listProjects()).data);
  const projectId = route.query.project || projects[0]?.id;
  if (!projectId) throw new Error('No project is available.');
  const locations = results((await services.listProjectLocations(projectId)).data);
  const locationId = route.query.location || locations[0]?.id;
  if (!locationId) throw new Error('No location is available.');
  const versions = results((await services.listVersions(locationId)).data);
  const versionId = route.query.version || versions.find((item) => item.status === 'published')?.id || versions[0]?.id;
  if (!versionId) throw new Error('No version is available.');
  tour.value = (await services.getVersion(locationId, versionId)).data;
}

async function loadTour() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = String(route.params.token || route.query.token || route.query.public_token || '');
    if (isPublicMode.value || token) await loadPublicTour(token);
    else await loadPrivateTour();
  } catch (cause) {
    errorMessage.value = cause.response?.data?.detail || cause.message || 'Could not load tour data.';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/');
}

onMounted(loadTour);
onBeforeUnmount(() => viewer.value?.dispose?.());
</script>

<template>
  <div class="vr360-production-page">
    <p v-if="loading" class="viewer-error">Loading tour…</p>
    <p v-else-if="errorMessage" class="viewer-error">{{ errorMessage }}</p>
    <Vr360ViewerLayout v-else ref="viewer" :tour="tour" :options="options" @back="goBack" @error="errorMessage = $event.message || 'The viewer could not render this tour.'" />
  </div>
</template>
