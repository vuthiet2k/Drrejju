import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { lang, toggleLang } from "./langState.js";
import { useIsMobile } from "./useIsMobile.js";
import { getThanhCongDict } from "./thanhCongData.js";

// Danh sách route theo từng "màn hình" gốc (bản thiết kế cũ dùng 1 state
// screen duy nhất; nay mỗi màn hình là 1 route riêng theo cấu trúc Vue Router
// của dự án).
const NAV_DEF = [
  ["overview", "navOverview", "ThanhCongTrangChu"],
  ["sites", "navSites", "ThanhCongTrangChu", "sec-sites"],
  ["festivals", "navFest", "ThanhCongTrangChu", "sec-festivals"],
  ["map", "navMap", "ThanhCongBanDo"],
  ["vr", "navVr", "ThanhCongVr360"],
  ["3d", "navD3", "ThanhCongMoHinh3D"],
];

// Route "chi tiết" (con) tương ứng với từng mục nav trên header — dùng để
// vẫn tô sáng đúng mục khi đang xem trang chi tiết (không còn ở trang chủ).
const CHILD_ROUTES_BY_KEY = {
  overview: ["ThanhCongChiTietChuDe"],
  sites: ["ThanhCongChiTietDiTich"],
  festivals: ["ThanhCongChiTietLeHoi"],
};

/**
 * Composable dùng chung cho header + toàn bộ trang app_thanh_cong:
 * ngôn ngữ, breakpoint mobile, từ điển t, và các hàm điều hướng
 * (thay cho this.setState({screen:...}) ở bản gốc).
 */
export function useThanhCongShared() {
  const route = useRoute();
  const router = useRouter();

  const t = computed(() => getThanhCongDict(lang.value));
  const { isMobile, windowWidth } = useIsMobile(640);
  const isDesktop = computed(() => !isMobile.value);
  const showSecondary = true; // props.showSecondaryLang mặc định true ở bản gốc
  const highlightMajorSites = true; // props.highlightMajorSites mặc định true ở bản gốc

  const langVi = computed(() => lang.value === "vi");
  const langEn = computed(() => lang.value === "en");
  const viActiveBg = computed(() => (langVi.value ? "#9E3B2E" : "#FBF5E8"));
  const viActiveBorder = computed(() => (langVi.value ? "#9E3B2E" : "#D8C5A2"));
  const viOpacity = computed(() => (langVi.value ? "1" : ".5"));
  const enActiveBg = computed(() => (langEn.value ? "#9E3B2E" : "#FBF5E8"));
  const enActiveBorder = computed(() => (langEn.value ? "#9E3B2E" : "#D8C5A2"));
  const enOpacity = computed(() => (langEn.value ? "1" : ".5"));

  const goHome = () => {
    router.push({ name: "ThanhCongTrangChu" });
    window.scrollTo({ top: 0 });
  };
  const goMap = () => router.push({ name: "ThanhCongBanDo" });
  const goVr = () => router.push({ name: "ThanhCongVr360" });
  const go3d = () => router.push({ name: "ThanhCongMoHinh3D" });
  const openDetail = (id) => () =>
    router.push({ name: "ThanhCongChiTietDiTich", params: { slug: id } });
  const openTheme = (id) => () => {
    router.push({ name: "ThanhCongChiTietChuDe", params: { slug: id } });
    window.scrollTo({ top: 0 });
  };
  const openFestival = (id) => () => {
    router.push({ name: "ThanhCongChiTietLeHoi", params: { slug: id } });
    window.scrollTo({ top: 0 });
  };
  // Mở VR360 của ĐÚNG điểm di tích: truyền id qua query ?diem=<id>.
  const openVr = (id) => () =>
    router.push({ name: "ThanhCongVr360", query: id ? { diem: id } : {} });
  const open3d = () => () => router.push({ name: "ThanhCongMoHinh3D" });

  // Cuộn tới 1 section trên trang chủ (mục "Địa điểm" / "Lễ hội" ở header):
  // nếu đang ở route khác thì điều hướng về trang chủ trước, đợi DOM render
  // xong (2 rAF) rồi mới scrollIntoView; nếu đã ở trang chủ thì cuộn ngay.
  const goSection = (anchorId) => () => {
    const scroll = () => {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (route.name !== "ThanhCongTrangChu") {
      router.push({ name: "ThanhCongTrangChu" }).then(() => {
        requestAnimationFrame(() => requestAnimationFrame(scroll));
      });
    } else {
      scroll();
    }
  };

  const navItems = computed(() =>
    NAV_DEF.map(([key, labelKey, routeName, anchorId]) => {
      const active =
        (!anchorId && route.name === routeName) ||
        (CHILD_ROUTES_BY_KEY[key] || []).includes(route.name);
      return {
        label: t.value[labelKey],
        active,
        color: active ? "#9E3B2E" : "#5A4A39",
        onClick: anchorId
          ? goSection(anchorId)
          : () => router.push({ name: routeName }),
      };
    }),
  );

  return {
    route,
    router,
    lang,
    toggleLang,
    t,
    isMobile,
    windowWidth,
    isDesktop,
    showSecondary,
    highlightMajorSites,
    langVi,
    langEn,
    viActiveBg,
    viActiveBorder,
    viOpacity,
    enActiveBg,
    enActiveBorder,
    enOpacity,
    navItems,
    goHome,
    goMap,
    goVr,
    go3d,
    openDetail,
    openTheme,
    openFestival,
    openVr,
    open3d,
  };
}
