// composables/useTranslate.js
import { ref } from "vue";

export function useTranslate() {
  const currentLanguage = ref(localStorage.getItem("lang") || "vi");

  const initTranslate = () => {
    const savedLang = localStorage.getItem("lang") || "vi";

    // Nếu là tiếng Việt → KHÔNG init Google Translate
    if (savedLang === "vi") return;

    // Inject script Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "vi",
          includedLanguages: "en,zh-CN,fr,es",
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);

    // Khi Google Translate load xong → tự chuyển sang ngôn ngữ đã chọn
    setTimeout(() => {
      const select = document.querySelector("select.goog-te-combo");
      if (select) {
        select.value = savedLang;
        select.dispatchEvent(new Event("change"));
      }
    }, 1000);
  };

  const setLanguage = (lang) => {
    localStorage.setItem("lang", lang);
    currentLanguage.value = lang;

    // Nếu quay lại tiếng Việt → xóa cookie dịch
    if (lang === "vi") {
      removeCookiesByName("googtrans");
    }

    // Reload để init lại đúng logic (có dịch hay không)
    window.location.reload();
  };

  return {
    currentLanguage,
    initTranslate,
    setLanguage,
    getCurrentLanguage: () => currentLanguage.value,
  };
}

function removeCookiesByName(cookieName) {
  const cookieArray = document.cookie.split(";");
  cookieArray.forEach((cookie) => {
    cookie = cookie.trim();
    if (cookie.startsWith(cookieName + "=")) {
      document.cookie =
        cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    }
  });
}
