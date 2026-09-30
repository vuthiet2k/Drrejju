import { ref } from "vue"
import API from "@/app_manage_dynamic_api/helper/api/useAxios";
import { ConfigSystem } from "@/base/store/api/server_api";

const buildCompanyInforFromEnv = () => {
    const env = process.env;

    return {
        id: env.VUE_APP_ORG_ID || "",
        created_date: "",
        updated_date: "",
        is_deleted: false,

        code: env.VUE_APP_ORG_CODE || "",
        name: env.VUE_APP_ORG_NAME || "",
        slug: env.VUE_APP_ORG_SLUG || "",
        short_name: env.VUE_APP_ORG_SHORT_NAME || "",
        description: env.VUE_APP_ORG_DESCRIPTION || "",

        photo: env.VUE_APP_ORG_PHOTO || "",
        founding_date: env.VUE_APP_ORG_FOUNDING_DATE || "",

        representative: env.VUE_APP_ORG_REPRESENTATIVE || "",
        representative_title: env.VUE_APP_ORG_REPRESENTATIVE_TITLE || "",

        address: env.VUE_APP_ORG_ADDRESS || "",
        tax_code: env.VUE_APP_ORG_TAX_CODE || "",
        phone_number: env.VUE_APP_ORG_PHONE || null,
        fax: env.VUE_APP_ORG_FAX || "",
        email: env.VUE_APP_ORG_EMAIL || "",
        website: env.VUE_APP_ORG_WEBSITE || "",

        organization_head: null,

        social_network_link: safeParseJSON(
            env.VUE_APP_ORG_SOCIAL_LINKS,
            {}
        ),
    };
};

const safeParseJSON = (value, fallback = {}) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const defaultCompanyInfor = buildCompanyInforFromEnv();

// ✅ Reactive state
const CompanyInfor = ref({ ...defaultCompanyInfor });

// ✅ Hàm reset thông tin
const resetCompanyInfor = () => {
    CompanyInfor.value = { ...defaultCompanyInfor };

    // Nếu muốn reset luôn ConfigSystem
    ConfigSystem.value.name = "DTWIN CONFIG";
    ConfigSystem.value.logo = require("@/assets/images/logo/metadatawin.png");
    ConfigSystem.value.config.contact = {
        address: "",
        website: "",
        phone: "0123.456.789",
        email: "your_organization@gmail.com",
        fax: "Your Company Tax Number",
    };
    ConfigSystem.value.config.title_vn = "TÊN TỔ CHỨC CỦA BẠN";
    ConfigSystem.value.config.title_en = "Your Organization Name - YON";
};

// ✅ Hàm lấy thông tin công ty
const getCompanyInfor = async () => {
    if (!process.env.VUE_APP_ID_ORGANIZATION) return;

    try {
        let data = await API().get(`organization/${process.env.VUE_APP_ID_ORGANIZATION}`);
        if (!data) return;

        CompanyInfor.value = { ...data };

        if (data.photo) {
            changeFavicon(data.photo);
        }

        ConfigSystem.value.name = CompanyInfor.value.name || "DTWIN CONFIG";
        if (CompanyInfor.value.photo) ConfigSystem.value.logo = CompanyInfor.value.photo;

        ConfigSystem.value.config.contact.address = CompanyInfor.value.address;
        ConfigSystem.value.config.contact.website = CompanyInfor.value.website;
        ConfigSystem.value.config.contact.phone = CompanyInfor.value.phone_number || "0123.456.789";
        ConfigSystem.value.config.contact.email = CompanyInfor.value.email || "your_organization@gmail.com";
        ConfigSystem.value.config.contact.fax = CompanyInfor.value.fax || "Your Company Tax Number";

        ConfigSystem.value.config.title_vn = CompanyInfor.value.short_name || "TÊN TỔ CHỨC CỦA BẠN";
        ConfigSystem.value.config.title_en = CompanyInfor.value.name || "Your Organization Name - YON";
    } catch (error) {
        console.error(error);
    }
};

function changeFavicon(newIconUrl) {
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = newIconUrl;
    }
}


export { CompanyInfor, getCompanyInfor, resetCompanyInfor }