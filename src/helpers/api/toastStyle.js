import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { ref } from "vue";
const TIMECLOSE = 3000;

export const successToast = (title, position = "bottom") => {
  let toastPosition = toast.POSITION.BOTTOM_RIGHT;

  if (position == "top") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "top-right") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "bottom-right") {
    toastPosition = toast.POSITION.BOTTOM_RIGHT;
  } else if (position == "bottom-left") {
    toastPosition = toast.POSITION.BOTTOM_LEFT;
  } else if (position == "top-left") {
    toastPosition = toast.POSITION.TOP_LEFT;
  }

  toast.success(title, {
    theme: "colored",
    position: toastPosition,
    autoClose: TIMECLOSE,
  });
};

export const errorToast = (title, position = "bottom") => {
  let toastPosition = toast.POSITION.BOTTOM_RIGHT;

  if (position == "top") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "top-right") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "bottom-right") {
    toastPosition = toast.POSITION.BOTTOM_RIGHT;
  } else if (position == "bottom-left") {
    toastPosition = toast.POSITION.BOTTOM_LEFT;
  } else if (position == "top-left") {
    toastPosition = toast.POSITION.TOP_LEFT;
  }
  toast.error(title, {
    theme: "colored",
    position: toastPosition,
    autoClose: TIMECLOSE,
  });
};

export const warningToast = (title, position = "bottom") => {
  let toastPosition = toast.POSITION.BOTTOM_RIGHT;

  if (position == "top") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "top-right") {
    toastPosition = toast.POSITION.TOP_RIGHT;
  } else if (position == "bottom-right") {
    toastPosition = toast.POSITION.BOTTOM_RIGHT;
  } else if (position == "bottom-left") {
    toastPosition = toast.POSITION.BOTTOM_LEFT;
  } else if (position == "top-left") {
    toastPosition = toast.POSITION.TOP_LEFT;
  }

  toast.warning(title, {
    theme: "colored",
    position: toastPosition,
    autoClose: TIMECLOSE,
  });
};

const toastId = ref("");
export const loadingToast = (text) =>
  (toastId.value = toast.loading(text, {
    autoClose: false,
    transition: toast.TRANSITIONS.SLIDE,
    position: toast.POSITION.BOTTOM_RIGHT,
    icon: false,
  }));
export const closeLoadingToast = () => {
  toast.remove(toastId.value);
};
