<script>
import { layoutComputed } from "@/state/helpers";
import { getMenuCurrentPage } from "@/router/routerVar.js"
export default {
  props: {
    slug: {
      type: String,
      default: "kcn-song-cong-2",
    },
    chooseMenu: {
      type: String,
      default: "none",
    },
  },
  data() {
    return {
      settings: {
        minScrollbarLength: 60,
      },
      menuApp: []
    };
  },
  computed: {
    ...layoutComputed,
    layoutType: {
      get() {
        return this.$store ? this.$store.state.layout.layoutType : {} || {};
      },
    },
  },
  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    if (document.querySelectorAll(".navbar-nav .collapse")) {
      let collapses = document.querySelectorAll(".navbar-nav .collapse");

      collapses.forEach((collapse) => {
        // Hide sibling collapses on `show.bs.collapse`
        collapse.addEventListener("show.bs.collapse", (e) => {
          e.stopPropagation();
          let closestCollapse = collapse.parentElement.closest(".collapse");
          if (closestCollapse) {
            let siblingCollapses =
              closestCollapse.querySelectorAll(".collapse");
            siblingCollapses.forEach((siblingCollapse) => {
              if (siblingCollapse.classList.contains("show")) {
                siblingCollapse.classList.remove("show");
                siblingCollapse.parentElement.firstChild.setAttribute(
                  "aria-expanded",
                  "false"
                );
              }
            });
          } else {
            let getSiblings = (elem) => {
              // Setup siblings array and get the first sibling
              let siblings = [];
              let sibling = elem.parentNode.firstChild;
              // Loop through each sibling and push to the array
              while (sibling) {
                if (sibling.nodeType === 1 && sibling !== elem) {
                  siblings.push(sibling);
                }
                sibling = sibling.nextSibling;
              }
              return siblings;
            };
            let siblings = getSiblings(collapse.parentElement);
            siblings.forEach((item) => {
              if (item.childNodes.length > 2) {
                item.firstElementChild.setAttribute("aria-expanded", "false");
                item.firstElementChild.classList.remove("active");
              }
              let ids = item.querySelectorAll("*[id]");
              ids.forEach((item1) => {
                item1.classList.remove("show");
                item1.parentElement.firstChild.setAttribute(
                  "aria-expanded",
                  "false"
                );
                item1.parentElement.firstChild.classList.remove("active");
                if (item1.childNodes.length > 2) {
                  let val = item1.querySelectorAll("ul li a");

                  val.forEach((subitem) => {
                    if (subitem.hasAttribute("aria-expanded"))
                      subitem.setAttribute("aria-expanded", "false");
                  });
                }
              });
            });
          }
        });

        // Hide nested collapses on `hide.bs.collapse`
        collapse.addEventListener("hide.bs.collapse", (e) => {
          e.stopPropagation();
          let childCollapses = collapse.querySelectorAll(".collapse");
          childCollapses.forEach((childCollapse) => {
            let childCollapseInstance = childCollapse;
            childCollapseInstance.classList.remove("show");
            childCollapseInstance.parentElement.firstChild.setAttribute(
              "aria-expanded",
              "false"
            );
          });
        });
      });
    }
    const menus = getMenuCurrentPage()
    this.menuApp = menus
  },

  methods: {
    onRoutechange(ele) {
      this.initActiveMenu(ele.path);
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition =
          document.getElementsByClassName("mm-active")[0].offsetTop;
        if (currentPosition > 500)
          if (this.$refs.isSimplebar)
            this.$refs.isSimplebar.value.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    },

    initActiveMenu(ele) {
      setTimeout(() => {
        if (document.querySelector("#navbar-nav")) {
          let a = document
            .querySelector("#navbar-nav")
            .querySelector('[href="' + ele + '"]');
          if (a) {
            a.classList.add("active");
            let parentCollapseDiv = a.closest(".collapse.menu-dropdown");
            if (parentCollapseDiv) {
              parentCollapseDiv.classList.add("show");
              parentCollapseDiv.parentElement.children[0].classList.add(
                "active"
              );
              parentCollapseDiv.parentElement.children[0].setAttribute(
                "aria-expanded",
                "true"
              );
              if (
                parentCollapseDiv.parentElement.closest(
                  ".collapse.menu-dropdown"
                )
              ) {
                parentCollapseDiv.parentElement
                  .closest(".collapse")
                  .classList.add("show");
                if (
                  parentCollapseDiv.parentElement.closest(".collapse")
                    .previousElementSibling
                )
                  parentCollapseDiv.parentElement
                    .closest(".collapse")
                    .previousElementSibling.classList.add("active");
                const grandparent = parentCollapseDiv.parentElement
                  .closest(".collapse")
                  .previousElementSibling.parentElement.closest(".collapse");
                if (
                  grandparent &&
                  grandparent &&
                  grandparent.previousElementSibling
                ) {
                  grandparent.previousElementSibling.classList.add("active");
                  grandparent.classList.add("show");
                }
              }
            }
          }
        }
      }, 0);
    },
  },
};
</script>

<template>
  <b-container fluid>
    <div id="two-column-menu"></div>

    <template v-if="layoutType === 'twocolumn'"></template>

    <template v-else>
      <ul class="navbar-nav h-100" id="navbar-nav" v-if="chooseMenu === `ban-do`">
        <li class="menu-title">
          <span data-key="t-menu"> MENU </span>
        </li>
        <li class="nav-item" v-for="(menu, index) in menuApp" :key="menu">
          <b-link class="nav-link menu-link" :href="'#sidebarMenu' + index" data-bs-toggle="collapse" role="button"
            aria-expanded="true" :aria-controls="'sidebarMenu' + index">
            <i :class="menu?.meta?.icon"></i>
            <span data-key="t-dashboards">{{ menu?.meta?.name }}</span>
          </b-link>
          <div class="collapse menu-dropdown show" :id="'sidebarMenu' + index">
            <ul class="nav nav-sm flex-column">
              <li class="nav-item" v-for="sub in menu.subMenu" :key="sub">
                <router-link :to="sub.path" class="nav-link custom-abc" data-key="t-analytics">
                  {{ sub?.meta?.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div class="d-flex position-fixed bottom-0" id="bottom__menu">
        <p class="fs-11 text-white-50 mb-3" id="bottom__menu--content">
          {{ new Date().getFullYear() }} © DTwin Team. Design & Develop by DTwin Team
        </p>
      </div>
    </template>
  </b-container>
</template>
<style scoped>
#bottom__menu {
  padding: 0 10px;
}
</style>
