// Reads GPS coordinates straight out of an image File, no external EXIF
// library needed. Two independent readers are tried, since cameras disagree
// on where they put GPS data:
//   1) standard binary EXIF GPS IFD (tag 0x8825) — most phones/cameras
//   2) DJI-style XMP text block (drone-dji:GpsLatitude=...) — drone panoramas
// Must run on the ORIGINAL file before any resize/re-encode — redrawing
// through <canvas> (see imageResize.js) strips all metadata.

const HEAD_BYTES = 512 * 1024; // EXIF/XMP always sits near the start of a JPEG

export async function readGpsFromFile(file) {
  if (!file || !file.type?.startsWith("image/")) return null;
  try {
    const buf = await file.slice(0, HEAD_BYTES).arrayBuffer();
    return readExifGps(buf) || readXmpGps(buf);
  } catch (e) {
    console.warn("readGpsFromFile failed:", e.message);
    return null;
  }
}

function readAscii(view, offset, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

function readIfdTags(view, tiffStart, ifdOffset, little) {
  const tags = {};
  const count = view.getUint16(tiffStart + ifdOffset, little);
  for (let i = 0; i < count; i++) {
    const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, little);
    const type = view.getUint16(entryOffset + 2, little);
    const num = view.getUint32(entryOffset + 4, little);
    const valueOffset = entryOffset + 8;

    if (type === 5 || type === 10) {
      // RATIONAL / SRATIONAL — stored by reference (offset to num/denom pairs)
      const dataStart = tiffStart + view.getUint32(valueOffset, little);
      const rationals = [];
      for (let r = 0; r < num; r++) {
        const n = view.getInt32(dataStart + r * 8, little);
        const d = view.getInt32(dataStart + r * 8 + 4, little);
        rationals.push(d ? n / d : 0);
      }
      tags[tag] = { rationals };
    } else if (type === 2) {
      // ASCII — inline if <=4 bytes, else by reference
      const dataStart = num <= 4 ? valueOffset : tiffStart + view.getUint32(valueOffset, little);
      tags[tag] = { ascii: readAscii(view, dataStart, num).replace(/\0+$/, "") };
    } else if (type === 1) {
      tags[tag] = { byte: view.getUint8(valueOffset) };
    } else if (type === 4) {
      tags[tag] = { long: view.getUint32(valueOffset, little) };
    }
  }
  return tags;
}

function parseTiffGps(view, tiffStart) {
  const byteOrder = readAscii(view, tiffStart, 2);
  const little = byteOrder === "II";
  if (!little && byteOrder !== "MM") return null;

  const ifd0Offset = view.getUint32(tiffStart + 4, little);
  const ifd0Tags = readIfdTags(view, tiffStart, ifd0Offset, little);
  const gpsIfdOffset = ifd0Tags[0x8825]?.long;
  if (gpsIfdOffset == null) return null;

  const gps = readIfdTags(view, tiffStart, gpsIfdOffset, little);
  const latRef = gps[1]?.ascii;
  const lat = gps[2]?.rationals;
  const lngRef = gps[3]?.ascii;
  const lng = gps[4]?.rationals;
  const altRef = gps[5]?.byte;
  const alt = gps[6]?.rationals;
  if (!lat || !lng) return null;

  const toDecimal = (dms) => dms[0] + dms[1] / 60 + dms[2] / 3600;
  let latitude = toDecimal(lat);
  let longitude = toDecimal(lng);
  if (latRef === "S") latitude = -latitude;
  if (lngRef === "W") longitude = -longitude;
  let altitude = alt ? alt[0] : null;
  if (altitude != null && altRef === 1) altitude = -altitude;

  return { lat: latitude, lng: longitude, altitude, heading: null };
}

function readExifGps(buf) {
  const view = new DataView(buf);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // not a JPEG

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00 || marker === 0xffd9 || marker === 0xffda) break; // not-a-marker / EOI / start-of-scan
    const size = view.getUint16(offset + 2);
    if (marker === 0xffe1 && readAscii(view, offset + 4, 4) === "Exif") {
      const gps = parseTiffGps(view, offset + 4 + 6);
      if (gps) return gps;
    }
    offset += 2 + size;
  }
  return null;
}

function readXmpGps(buf) {
  const text = new TextDecoder("latin1").decode(new Uint8Array(buf));
  const get = (name) => {
    const m = text.match(new RegExp(`[:]${name}="([^"]*)"`, "i"));
    return m ? m[1] : null;
  };
  const latStr = get("GpsLatitude") ?? get("GPSLatitude");
  const lngStr = get("GpsLongitude") ?? get("GPSLongitude");
  if (latStr == null || lngStr == null) return null;
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const altStr = get("AbsoluteAltitude") ?? get("RelativeAltitude");
  const headingStr = get("GimbalYawDegree") ?? get("FlightYawDegree");
  const altitude = altStr != null ? parseFloat(altStr) : null;
  const heading = headingStr != null ? parseFloat(headingStr) : null;

  return {
    lat,
    lng,
    altitude: Number.isNaN(altitude) ? null : altitude,
    heading: Number.isNaN(heading) ? null : heading,
  };
}

export function formatGps(gps) {
  if (!gps) return null;
  const alt = gps.altitude != null ? ` · ${gps.altitude.toFixed(0)}m` : "";
  return `${gps.lat.toFixed(6)}°, ${gps.lng.toFixed(6)}°${alt}`;
}
