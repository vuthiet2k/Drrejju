const stringToObjectLatLng = function (location, split = ",") {
  let arr = location.split(split);
  return { lat: arr[0].trim(), lng: arr[1].trim() };
};

const arrayToObjectLatLng = function (arr) {
  return { lat: arr[1], lng: arr[0] };
};

const limitText = function (text, maxLength) {
  // THÊM KIỂM TRA NULL/UNDEFINED
  if (!text || typeof text !== 'string') return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
const getDifferentArray = function (array1, array2) {
  const result = array1.filter((item) => !array2.some((x) => x.id === item.id));
  if (array2.length === array1.length) return [];
  return result;
};
function debounce(func, delay) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
function parseDate(dateString) {
  const parsedDate = new Date(dateString);

  // Kiểm tra nếu đầu vào không hợp lệ
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // Thử chuyển đổi nếu định dạng không hợp lệ
  const formats = [
    /\b(\d{2})\/(\d{2})\/(\d{4})\b/, // dd/mm/yyyy
    /\b(\d{4})-(\d{2})-(\d{2})\b/,   // yyyy-mm-dd
    /\b(\d{2})-(\d{2})-(\d{4})\b/,   // dd-mm-yyyy
    /\b(\d{4})\/(\d{2})\/(\d{2})\b/, // yyyy/mm/dd
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, d, m, y] = match;
      return new Date(`${y}-${m}-${d}`);
    }
  }

  return new Date("Invalid Date"); // Trả về một giá trị không hợp lệ nếu không nhận diện được định dạng
}
const base64Encode = (str) => {
  // For browser environments
  if (typeof window !== 'undefined') {
    // Convert string to UTF-8 array and then to base64
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  // For Node.js environments (if your app runs SSR)
  else if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  // Fallback (less ideal)
  return btoa(unescape(encodeURIComponent(str)));
};
// Hàm định dạng ngày giờ với đầu vào là Date object
function formatDateTime(inputDate = new Date()) {
  const now = inputDate instanceof Date ? inputDate : new Date(inputDate);
  
  // Danh sách thứ trong tuần bằng tiếng Việt
  const weekdays = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  // Lấy thứ, ngày, tháng, năm
  const dayName = weekdays[now.getDay()];
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  // Định dạng "Thứ X, dd/mm/yyyy"
  const formattedDate = `${dayName}, ${day}/${month}/${year}`;
  const vnDate = `${day}/${month}/${year}`;

  // Định dạng giờ: phút
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const formattedTime = `${hour}:${minute}`;
  const vnTime = `${hour}h${minute}`;

  // Tính múi giờ (GMT +X)
  const offsetHours = -now.getTimezoneOffset() / 60;
  const sign = offsetHours >= 0 ? "+" : "";
  const timezone = `GMT ${sign}${offsetHours}`;

  // Trả về object chứa tất cả thông tin
  return {
    date: formattedDate,
    time: formattedTime,
    timezone: timezone,
    fullDateTime: `${formattedDate} ${formattedTime} (${timezone})`,
    vnDateTime: `${vnTime} ${vnDate}`,
    raw: now
  };
}

// Cách sử dụng:
// const result = formatDateTime(); // Mặc định là new Date()
// console.log(result.date);       // "Thứ năm, 28/11/2024"
// console.log(result.time);       // "14:30"
// console.log(result.timezone);   // "GMT +7"
// console.log(result.fullDateTime); // "Thứ năm, 28/11/2024 14:30 (GMT +7)"

// // Có thể truyền Date object khác
// const specificDate = new Date('2024-12-25T10:30:00');
// const christmas = formatDateTime(specificDate);
// console.log(christmas.date); // "Thứ tư, 25/12/2024"
export {
  stringToObjectLatLng,
  arrayToObjectLatLng,
  limitText,
  debounce,
  getDifferentArray,
  parseDate,
  base64Encode,
  formatDateTime
};
