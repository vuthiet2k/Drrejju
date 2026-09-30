import { inject } from "vue";
import Select from "@/base/components/select/Select.vue";
import DateInput from "@/base/components/date/date.vue";
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue";
import Photo from "@/base/components/photo/Photo.vue";
import Images from "@/base/components/photo/Images.vue";
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import FormLoading from "../components/FormLoading.vue";
import MapLocation from "@/base/components/type_form_record/MapLocation.vue";
import Object3d from "@/base/components/object3d/Object3d.vue";
import TextEditor from "@/base/components/editor/TextEditor.vue";
import FormManageList from "@/base/components/manage-list/FormManageList.vue";

export const setup = () => {
  return {
    apiPath: inject("source-api"),
    manage_data: inject("manage-data"),
    successCode: [200, 201],
  };
};

export const data = () => {
  return {
    AUTOPASS_FIELDS: ["date", "text", "datetime", 'switch'],
    STRINGTIFY_FIELDS: ['manage-list'],
    formUrl: inject("form-url"),
    currentObjectId: "",
    formStructures: {},
    formStructuresAdd: [],
    isLoadingFormAdd: false,
    formStructuresEdit: [],
    isLoadingFormEdit: false,
    formStructuresView: [],
    isLoadingFormView: false,
    selectedPermissons: [],
    formsTemplate: [],
    formTypes: {
      text: "text",
      textarea: "textarea",
      texteditor: "text_editor",
      datetime: "datetime",
      date: "date",
      select: "select",
      image: "image",
      point: "point",
      switch: "switch",
      polygon: "polygon",
      line: "line",
      object3d: "object3d",
      manageList: "manage-list"
    },
    dataTypes: {
      string: "string",
      string_separate: "string_separate",
      foreign_key: "foreign_key",
      boolean: "boolean",
      json: "json",
      file: "file",
      multi_file: "multi_file",
      dynamic_file_or_foreign_key: "dynamic_file_or_foreign_key",
      manageList: "manage-list"
    },
    mappingRegex: "/(<_mapping::[^>]+>)/"
  };
};

export const components = {
  Select,
  DateInput,
  AccordionRecord,
  LayoutRecord,
  FormLoading,
  Photo,
  Images,
  MapLocation,
  Object3d,
  TextEditor,
  FormManageList
};

export const mounted = async function() {
  this.handleClickAdd();
};