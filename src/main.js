import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Token from "@/helpers/user/user.js";
import AOS from "aos";
import "aos/dist/aos.css";
import i18n from "./i18n";
import store from "./helpers/state/store";
import BootstrapVue3 from "bootstrap-vue-3";
import vClickOutside from "click-outside-vue3";
import VueApexCharts from "vue3-apexcharts";
import Maska from "maska";
import { createPinia } from "pinia";
import VueFeather from "vue-feather";
import vue3GoogleLogin from 'vue3-google-login'
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import Divider from 'primevue/divider';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import "@/assets/scss/config/default/app.scss";
import "@vueform/slider/themes/default.css";
import "@/assets/scss/mermaid.min.css";

const pinia = createPinia();

AOS.init({
  easing: "ease-out-back",
  duration: 1000,
});
const { getUser } = Token();

async function initApp() {
  try {
    await getUser();
  } catch (err) {
    console.error(err);
  }
  createApp(App)
    .use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none' // ⛔ CHẶN AUTO DARK
        }
      }
    })
    .use(store)
    .use(pinia)
    .use(router)
    .use(VueApexCharts)
    .use(ConfirmationService)
    .use(BootstrapVue3)
    .directive('tooltip', Tooltip)
    .component('divider', Divider)
    .component(VueFeather.type, VueFeather)
    .use(Maska)
    .use(i18n)
    .use(vClickOutside)
    .use(vue3GoogleLogin, {
      clientId: '20922433943-40c9q9t6gfufqsmbp6osbjo6c1urjm2h.apps.googleusercontent.com'
    })
    .mount("#app");
}
initApp();
