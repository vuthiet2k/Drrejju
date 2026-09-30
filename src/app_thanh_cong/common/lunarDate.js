// ══════════════════════════════════════════════════════════════════════
//  ÂM LỊCH VIỆT NAM — đổi ngày âm ⇄ dương (múi giờ UTC+7)
//
//  Toàn bộ 15 lễ hội trong thanhCongData.js ghi ngày theo ÂM LỊCH
//  (trường m/d kèm cal:'al'). Trước đây trang chủ đọc thẳng m/d rồi dựng
//  new Date(y, m-1, d) — tức diễn giải ngày âm như ngày dương, khiến mốc
//  "đang diễn ra" và số ngày đếm ngược lệch 3–7 tuần (ví dụ Rằm tháng
//  Giêng bị tính thành 15/01 dương thay vì cuối tháng 2 / đầu tháng 3).
//  Module này cung cấp phép đổi đúng để tính lịch.
//
//  Thuật toán: Hồ Ngọc Đức (https://www.informatik.uni-leipzig.de/~duc/amlich/)
//  — cùng thuật toán các lịch vạn niên Việt Nam đang dùng; múi giờ chuẩn
//  của lịch Việt Nam là +7.
// ══════════════════════════════════════════════════════════════════════
const PI = Math.PI;
const TZ_VN = 7;

const INT = (d) => Math.floor(d);

// Số ngày Julius của một ngày dương lịch (lịch Gregory, có xử lý Julius
// cho mốc trước 15/10/1582).
function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

// Ngược lại: số ngày Julius → [ngày, tháng, năm] dương lịch.
function jdToDate(jd) {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

// Thời điểm sóc (new moon) thứ k tính từ 1/1/1900, trả về theo ngày Julius.
function newMoon(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.6705065 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}

// Kinh độ mặt trời (radian) tại một thời điểm Julius.
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - PI * 2 * INT(L / (PI * 2));
  return L;
}

const getSunLongitude = (dayNumber, tz) => INT((sunLongitude(dayNumber - 0.5 - tz / 24) / PI) * 6);
const getNewMoonDay = (k, tz) => INT(newMoon(k) + 0.5 + tz / 24);

// Ngày bắt đầu tháng 11 âm lịch của năm dương yy (mốc neo của cả năm âm).
function getLunarMonth11(yy, tz) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, tz);
  if (getSunLongitude(nm, tz) >= 9) nm = getNewMoonDay(k - 1, tz);
  return nm;
}

// Vị trí tháng nhuận trong năm âm bắt đầu từ a11.
function getLeapMonthOffset(a11, tz) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Đổi ngày âm lịch → ngày dương lịch.
 * @param {number} lunarDay   ngày âm (1–30)
 * @param {number} lunarMonth tháng âm (1–12)
 * @param {number} lunarYear  năm âm
 * @param {number} [lunarLeap] 1 nếu là tháng nhuận, 0 (mặc định) nếu không
 * @param {number} [tz] múi giờ, mặc định +7 (lịch Việt Nam)
 * @returns {[number, number, number]} [ngày, tháng, năm] dương; [0,0,0] nếu
 *          tháng nhuận yêu cầu không tồn tại trong năm âm đó.
 */
export function lunarToSolar(lunarDay, lunarMonth, lunarYear, lunarLeap = 0, tz = TZ_VN) {
  let a11;
  let b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, tz);
    b11 = getLunarMonth11(lunarYear, tz);
  } else {
    a11 = getLunarMonth11(lunarYear, tz);
    b11 = getLunarMonth11(lunarYear + 1, tz);
  }
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, tz);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap !== 0 && lunarMonth !== leapMonth) return [0, 0, 0];
    if (lunarLeap !== 0 || off >= leapOff) off += 1;
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  const monthStart = getNewMoonDay(k + off, tz);
  return jdToDate(monthStart + lunarDay - 1);
}

/**
 * Ngày dương (Date, giờ địa phương 00:00) tương ứng một ngày âm lịch của
 * một năm âm cho trước. Trả về null nếu ngày âm không tồn tại.
 * @param {number} lunarDay
 * @param {number} lunarMonth
 * @param {number} lunarYear
 * @returns {Date|null}
 */
export function lunarToDate(lunarDay, lunarMonth, lunarYear) {
  const [d, m, y] = lunarToSolar(lunarDay, lunarMonth, lunarYear);
  if (!y) return null;
  return new Date(y, m - 1, d);
}
