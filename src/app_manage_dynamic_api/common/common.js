const stringToObjectLatLng = function (location, split = ",") {
  let arr = location.split(split);
  return { lat: arr[0].trim(), lng: arr[1].trim() };
};

const arrayToObjectLatLng = function (arr) {
  return { lat: arr[1], lng: arr[0] };
};

const limitText = function (text, maxLength) {
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + "...";
  }
  return text;
};

const getDifferentArray = function (array1, array2) {
  const result = array1.filter((item) => !array2.some((x) => x.id === item.id));
  if (array2.length === array1.length) return [];
  return result;
};
const swapArr = function (arr, index1, index2) {
  const temp = arr[index1];
  arr[index1] = arr[index2];
  arr[index2] = temp;
};
function debounce(func, delay) {
  let timerId;

  return function(...args) {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}

const getTime = (timestamp) => {
  const dateObj = new Date(timestamp);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // Tháng bắt đầu từ 0, nên cộng 1
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return formattedDate
}


const createObjectFile = (
  dataFile,
  nameFile,
  typeFile = "application/octet-stream"
) => {
  // Tạo đối tượng Blob từ dữ liệu
  const blob = new Blob([dataFile], { type: typeFile });

  // Tạo URL đến Blob
  const fileUrl = URL.createObjectURL(blob);

  // Tạo một phần tử <a> để tải xuống
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = nameFile;

  // Thêm phần tử <a> vào body và kích hoạt sự kiện click
  document.body.appendChild(link);
  link.click();

  // Xóa đối tượng <a> và URL
  document.body.removeChild(link);
  URL.revokeObjectURL(fileUrl);
};

export {
  stringToObjectLatLng,
  arrayToObjectLatLng,
  limitText,
  getDifferentArray,
  swapArr,
  debounce,
  getTime,
  createObjectFile
};
