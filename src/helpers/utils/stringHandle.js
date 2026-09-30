export function stringToSlug(str) {
  // remove accents
  var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
    to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  str = str.toLowerCase()
    .trim()
    // eslint-disable-next-line
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-');

  return str;
}
export function removeVietnamese(str) {
  if (!str || typeof(str) != typeof('')) return str
  // Bảng chữ cái tiếng Việt có dấu
  const vietnameseWithDiacritics = 'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ';

  // Bảng chữ cái tiếng Việt không dấu
  const vietnameseWithoutDiacritics = 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyy';

  // Loại bỏ dấu và chuyển thành chữ thường
  const removedDiacritics = str
    .toLowerCase()
    .replace(new RegExp('[' + vietnameseWithDiacritics + ']', 'g'), function (match) {
      return vietnameseWithoutDiacritics.charAt(vietnameseWithDiacritics.indexOf(match));
    });

  return removedDiacritics;
}

export function removeExtraSpaces(str) {
  if (!str || typeof(str) != typeof('')) return str
  return str.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}

export function isUUID(str) {
  if (!str || typeof str !== "string") return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function formatDateTimeVN(value) {
  if (!value) return "";

  const pad = (n) => String(n).padStart(2, "0");

  let date;

  // Nếu đã là Date object
  if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return "";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}