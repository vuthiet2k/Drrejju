import { createWebHistory, createRouter } from "vue-router";
/* eslint-disable */
import axios from "axios";
import routes from "./routes";
import appConfig from "../../app.config";
import store from "@/state/store";
import { RouterCheck } from "./middleware/authencation";
import { getListApplications } from "./middleware/applications";
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Use the HTML5 history API (i.e. normal-looking routes)
  // instead of routes with hashes (e.g. example.com/#/about).
  // This may require some server configuration in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  mode: "history",
  // Simulate native-like scroll behavior when navigating to a new
  // route and using back/forward buttons.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, left: 0 };
    }
  },
});
// console.log(routes)

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  await RouterCheck(to, from, next);
  await getListApplications();

});

export default router;
