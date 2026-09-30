<script>
import { useRouter } from "vue-router";
import User from "@/base/components/user/User.vue";
import ShowApp from "./user/ShowApp.vue";
import i18n from "@/i18n";
import { inject } from "vue";
import { ConfigSystem } from "@/base/store/api/server_api";

/**
 * Nav-bar Component
 */
export default {
  setup() {
    const router = useRouter();
    const currUser = inject("user");
    const goToPage = (to) => {
      router.push({ name: to });
    };
    return {
      goToPage,
      currUser,
    };
  },
  props: {
    address: {
      type: Object,
      default: function () {
        return {
          title: "",
          details: [],
        };
      },
    },
  },
  components: { User, ShowApp },
  data() {
    return {
      ConfigSystem: ConfigSystem,
      baseURL: "",
      languages: [],
      lan: i18n.locale,
      text: null,
      flag: null,
      value: null,
      myVar: 1,
    };
  },
  methods: {
    isCustomDropdown() {
      //Search bar
      var searchOptions = document.getElementById("search-close-options");
      var dropdown = document.getElementById("search-dropdown");
      var searchInput = document.getElementById("search-options");

      searchInput.addEventListener("focus", () => {
        var inputLength = searchInput.value.length;
        if (inputLength > 0) {
          dropdown.classList.add("show");
          searchOptions.classList.remove("d-none");
        } else {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });

      searchInput.addEventListener("keyup", () => {
        var inputLength = searchInput.value.length;
        if (inputLength > 0) {
          dropdown.classList.add("show");
          searchOptions.classList.remove("d-none");
        } else {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });

      searchOptions.addEventListener("click", () => {
        searchInput.value = "";
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      });

      document.body.addEventListener("click", (e) => {
        if (e.target.getAttribute("id") !== "search-options") {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });
    },
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    setLanguage(locale, country, flag) {
      this.lan = locale;
      this.text = country;
      this.flag = flag;
      document.getElementById("header-lang-img").setAttribute("src", flag);
      i18n.global.locale = locale;
    },
    toggleDarkMode() {
      if (document.documentElement.getAttribute("data-layout-mode") == "dark") {
        document.documentElement.setAttribute("data-layout-mode", "light");
      } else {
        document.documentElement.setAttribute("data-layout-mode", "dark");
      }
    },
    initTopbarComponents() {
      function updateCartPrice() {
        var currencySign = "$";
        var subtotal = 0;
        Array.from(document.getElementsByClassName("cart-item-price")).forEach(
          function (e) {
            subtotal += parseFloat(e.innerHTML);
          }
        );
        if (document.getElementById("cart-item-total")) {
          document.getElementById("cart-item-total").innerHTML =
            currencySign + subtotal.toFixed(2);
        }
      }

      if (document.getElementsByClassName("dropdown-item-cart")) {
        var dropdownItemCart = document.querySelectorAll(
          ".dropdown-item-cart"
        ).length;
        Array.from(
          document.querySelectorAll(
            "#page-topbar .dropdown-menu-cart .remove-item-btn"
          )
        ).forEach(function (item) {
          item.addEventListener("click", function () {
            dropdownItemCart--;
            this.closest(".dropdown-item-cart").remove();
            Array.from(
              document.getElementsByClassName("cartitem-badge")
            ).forEach(function (e) {
              e.innerHTML = dropdownItemCart;
            });
            updateCartPrice();
            if (document.getElementById("empty-cart")) {
              document.getElementById("empty-cart").style.display =
                dropdownItemCart == 0 ? "block" : "none";
            }
            if (document.getElementById("checkout-elem")) {
              document.getElementById("checkout-elem").style.display =
                dropdownItemCart == 0 ? "none" : "block";
            }
          });
        });
        Array.from(document.getElementsByClassName("cartitem-badge")).forEach(
          function (e) {
            e.innerHTML = dropdownItemCart;
          }
        );
        if (document.getElementById("empty-cart")) {
          document.getElementById("empty-cart").style.display = "none";
        }
        if (document.getElementById("checkout-elem")) {
          document.getElementById("checkout-elem").style.display = "block";
        }
        updateCartPrice();
      }

      // notification messages
      if (document.getElementsByClassName("notification-check")) {
        Array.from(
          document.querySelectorAll(".notification-check input")
        ).forEach(function (element) {
          element.addEventListener("click", function (el) {
            el.target.closest(".notification-item").classList.toggle("active");
          });
        });
      }
    },
  },
  computed: {},
  mounted() {},
};
</script>

<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex">
          <!-- LOGO -->
          <div class="navbar-brand-box horizontal-logo">
            <router-link to="/" class="logo logo-dark">
              <span class="logo-sm">
                <img :src="ConfigSystem.logo" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img
                  :src="ConfigSystem.logo"
                  alt=""
                  height="17"
                />
              </span>
            </router-link>

            <router-link to="/" class="logo logo-light">
              <span class="logo-sm">
                <img :src="ConfigSystem.logo" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img
                  :src="ConfigSystem.logo"
                  alt=""
                  height="17"
                />
              </span>
            </router-link>
          </div>
          <div class="dropdown topbar-head-dropdown ms-1 header-item">
            <button
              type="button"
              class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="bx bx-category-alt fs-22"></i>
            </button>
            <ShowApp></ShowApp>
          </div>

          <div
            class="d-flex justify-content-center gap-2 align-items-center ms-3"
          >
            <div class="d-flex justify-content-center flex-column">
              <span class="text-uppercase fs-14 text-b fw-semibold">
                {{ "QUẢN LÝ " + address.title }}
              </span>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center">
          <div class="dropdown d-md-none topbar-head-dropdown header-item">
            <button
              type="button"
              class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
              id="page-header-search-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="bx bx-search fs-22"></i>
            </button>
            <div
              class="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
              aria-labelledby="page-header-search-dropdown"
            >
              <form class="p-3">
                <div class="form-group m-0">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search ..."
                      aria-label="Recipient's username"
                    />
                    <b-button variant="primary" type="submit">
                      <i class="mdi mdi-magnify"></i>
                    </b-button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- <Notify></Notify> -->
          <User></User>
        </div>
      </div>
    </div>
  </header>
</template>
