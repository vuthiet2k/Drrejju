<script>
import NavBar from "../components/nav-bar";

export default {
  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
  },
  // methods: {
  //   onRoutechange(ele) {
  //     this.initActiveMenu(ele.path);
  //   },
  //   initActiveMenu(ele) {
  //     setTimeout(() => {
  //       if (document.querySelector("#navbar-nav")) {
  //         let a = document
  //           .querySelector("#navbar-nav")
  //           .querySelector('[href="' + ele + '"]');

  //         if (a) {
  //           a.classList.add("active");
  //           let parentCollapseDiv = a.closest(".collapse.menu-dropdown");
  //           if (parentCollapseDiv) {
  //             parentCollapseDiv.classList.add("show");
  //             parentCollapseDiv.parentElement.children[0].classList.add(
  //               "active"
  //             );
  //             parentCollapseDiv.parentElement.children[0].setAttribute(
  //               "aria-expanded",
  //               "true"
  //             );
  //             if (
  //               parentCollapseDiv.parentElement.closest(
  //                 ".collapse.menu-dropdown"
  //               )
  //             ) {
  //               parentCollapseDiv.parentElement
  //                 .closest(".collapse")
  //                 .classList.add("show");
  //               if (
  //                 parentCollapseDiv.parentElement.closest(".collapse")
  //                   .previousElementSibling
  //               )
  //                 parentCollapseDiv.parentElement
  //                   .closest(".collapse")
  //                   .previousElementSibling.classList.add("active");
  //             }
  //           }
  //         }
  //       }
  //     }, 1000);
  //   },
  // },
  components: {
    NavBar,
  },
};
</script>

<template>
  <div>
    <div id="layout-wrapper">
      <NavBar />
      <!-- ============================================================== -->
      <!-- Start Page Content here -->
      <!-- ============================================================== -->

      <div class="main-content" style="margin-left: 0 !important">
        <div class="page-content">
          <!-- Start Content-->
          <b-container fluid>
            <slot />
          </b-container>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-content .container-fluid {
  padding-inline: 0;
}
.page-content {
  padding-inline: 0;
}
</style>
