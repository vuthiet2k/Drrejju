// @/base/components/image/getImage.js
import ImageDefault from "@/assets/images/default/default-img.jpg";
import UserImageDefault from "@/assets/images/users/user-dummy-img.jpg";
import LogoDefault from "@/assets/images/logo/logo-cms.png";
export function getImage(src, fallback = ImageDefault) {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      return fallback;
    }
  
    const img = new Image();
    img.src = src;
  
    return new Promise((resolve) => {
      img.onload = () => resolve(src);
      img.onerror = () => resolve(fallback);
    });
  }

export {ImageDefault, UserImageDefault, LogoDefault};