import UseEditor from "../components/type_form_record/UseEditor.vue";
import UseInput from "../components/type_form_record/UseInput.vue";
import MapLocation from "../components/type_form_record/MapLocation.vue";

const getComponentType = (type, more = false) => {
  switch (type) {
    case "editor":
      return {
        component: UseEditor,
      };
    case "input":
      return {
        component: UseInput,
        props: {
          type: more ? more : "text",
        },
      };
    case "map":
      return {
        component: MapLocation,
      };
    default:
  }
};

export default getComponentType;
