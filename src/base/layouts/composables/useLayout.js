// layouts/components/composables/useLayout.js
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { applications } from "@/helpers/user/applications.js";
import { getMenuCurrentPage } from "@/router/routerVar.js";


export function useLayout() {
    const router = useRouter();
    const route = useRoute();

    const ALL_ROUTER_APP = router.getRoutes();

    // Refs
    const menuDetails = ref([]);
    const isShowingDetails = ref(false);
    const pathTabShowingDetails = ref("");
    const isMobile = ref(false);
    const showOffcanvas = ref(false);
    let offcanvasInstance = null;

    // Computed properties
    const showMenuDetails = computed(() => {
        const currentPath = route.path;
        const foundApp = applications.value.find((app) =>
            app.listPage.some((page) => currentPath.startsWith(`/${page.path}`))
        );
        return !!foundApp;
    });

    const currentAppInfo = computed(() => {
        const currentPath = route.path;
        const foundApp = applications.value.find((app) =>
            app.listPage.some((page) => currentPath.startsWith(`/${page.path}`))
        );

        if (foundApp) {
            const allPages = foundApp.listPage.map((page) => ({
                ...page,
                active: currentPath.startsWith(`/${page.path}`),
            }));

            const activePage = allPages.find((page) => page.active);

            return {
                app: foundApp,
                activePage: activePage,
                appTitle: foundApp.title,
                appId: foundApp.id,
                pageTitle: activePage?.meta?.title || "",
                pageIcon: activePage?.meta?.icon || "",
                allPages: allPages,
            };
        }

        const groupPage = getRoutesByGroup();
        if (groupPage?.length) {
            const allPages = groupPage.map((item) => ({
                ...item,
                active: item.name === route.name,
            }));

            const activePage = allPages.find((item) => item.active);

            return {
                app: groupPage[0]?.parent || groupPage[0],
                activePage: activePage,
                appTitle:
                    groupPage[0]?.parent?.meta?.title || groupPage[0]?.meta?.title || "",
                appId: groupPage[0]?.parent?.name || "",
                pageTitle: activePage?.meta?.title || activePage?.name || "",
                pageIcon: activePage?.meta?.icon || "",
                allPages: allPages,
            };
        }

        return null;
    });

    const activeMenu = computed(() => {
        return currentAppInfo.value?.activePage || null;
    });

    // Methods
    const handleMenuDetails = (item) => {

        if (isShowingDetails.value && pathTabShowingDetails.value == item.path) {
            isShowingDetails.value = false;
            return;
        }
        pathTabShowingDetails.value = item.path;
        const allTabApp = getMenuCurrentPage(`/${item.path}`, ALL_ROUTER_APP) || [];
        if (allTabApp?.[0]?.meta?.showNavSubMenu) {
            menuDetails.value = allTabApp.map((menu) => ({
                ...menu,
                subMenu: [
                    { ...menu, meta: { ...menu.meta, name: menu.meta.subName } },
                    ...menu.subMenu,
                ],
            }));
        } else {
            menuDetails.value = allTabApp;
        }
        isShowingDetails.value = true;
    };

    const openSettingsMenu = () => {
        if (isMobile.value) {
            // Load menu details for settings or handle differently
        }
    };

    const openOffcanvas = () => {
        showOffcanvas.value = true;
        if (offcanvasInstance) {
            offcanvasInstance.show();
        }
    };

    const closeOffcanvas = () => {
        showOffcanvas.value = false;
        if (offcanvasInstance) {
            offcanvasInstance.hide();
        }
    };

    const handleOffcanvasHide = () => {
        showOffcanvas.value = false;
    };

    // Route group methods
    const getRouteGroupInfo = (routeName, allRouter) => {
        const directRoute = allRouter.find((route) => route.name === routeName);
        if (directRoute) {
            return {
                route: directRoute,
                group: directRoute.meta?.group,
                isDirect: true,
            };
        }

        const parentRoute = allRouter.find((parent) =>
            parent.children?.some((child) => child.name === routeName)
        );

        if (parentRoute) {
            const childRoute = parentRoute.children.find(
                (child) => child.name === routeName
            );
            return {
                route: childRoute,
                parent: parentRoute,
                group: parentRoute.meta?.group || childRoute?.meta?.group,
                isDirect: false,
            };
        }

        return {
            route: null,
            group: null,
            isDirect: false,
        };
    };

    const getRoutesByGroup = (
        routeName = route.name,
        allRouter = ALL_ROUTER_APP
    ) => {
        const groupInfo = getRouteGroupInfo(routeName, allRouter);
        if (!groupInfo.group) return [];

        const groupRoutes = [];
        allRouter.forEach((route) => {
            if (route.children) {
                route.children.forEach((child) => {
                    if (child.meta?.group === groupInfo.group) {
                        groupRoutes.push({
                            ...child,
                            type: "child",
                            parent: route,
                        });
                    }
                });
            }
        });
        return groupRoutes;
    };

    const checkMobile = () => {
        isMobile.value = window.innerWidth < 768;
    };

    // Lifecycle
    onMounted(() => {
        checkMobile();
        window.addEventListener("resize", checkMobile);
    });

    // Watch for offcanvas state
    watch(showOffcanvas, (newVal) => {
        if (newVal && offcanvasInstance) {
            offcanvasInstance.show();
        }
    });

    return {
        // Refs
        menuDetails,
        isShowingDetails,
        pathTabShowingDetails,
        isMobile,
        showOffcanvas,

        // Computed
        showMenuDetails,
        currentAppInfo,
        activeMenu,

        // Methods
        handleMenuDetails,
        openSettingsMenu,
        openOffcanvas,
        closeOffcanvas,
        handleOffcanvasHide,
        checkMobile
    };
}