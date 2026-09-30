/* eslint-disable */
import API from "@/helpers/api/useAxios.js";
import { arrayToObjectLatLng } from "../common.js";

let map_options;
let typePOI;
let viewBox;
let keyMap;
let pastTime;
let futureTime;
let map_options_basic = {
  center: { lat: 21.036611471881113, lng: 105.99747752460313 },
  zoom: 10,
  mapType: "2d",
  controls: false,
  bearing: 0,
  tilt: 0,
};

function addCdnMap(key = 'fda0ef247812a0f208b654c89a8f9308') {
  let script = document.createElement("script");
  script.src = `https://api.map4d.vn/sdk/map/js?version=2.4&key=${key}`;
  document.head.appendChild(script);
}

const callOptionsMap = async () => {
  // await API()
  //   .get("config/map")
  //   .then((res) => {
  //     if (res?.message) {
  //       res = {
  //         map_config: {
  //           MAP4D_SECRET_KEY: "fda0ef247812a0f208b654c89a8f9308",
  //           bearing: "225",
  //           fax: "02899996889",
  //           future_time: "2030",
  //           lat: "21.275684",
  //           lng: "106.200836",
  //           past_time: "2000",
  //           tilt: "62.5",
  //           time_step: "1",
  //           type: "roadmap",
  //           viewbox:
  //             "21.68368299829859,105.4735689739972,21.981983122929098,105.78599265467678",
  //           zoom: "19",
  //         },
  //       };
  //     }
  //     res = res.map_config;
  //     addCdnMap(res.MAP4D_SECRET_KEY);
  //     map_options = {
  //       center: { lat: res.lat, lng: res.lng },
  //       zoom: parseFloat(res.zoom),
  //       mapType: res.type,
  //       controls: false,
  //       bearing: parseFloat(res.bearing),
  //       tilt: parseFloat(res.tilt),
  //     };
  //     typePOI = res.suggestion ?? [];
  //     viewBox = res.viewbox;
  //     keyMap = res.MAP4D_SECRET_KEY;
  //     pastTime = res.past_time ?? 2000;
  //     futureTime = res.future_time ?? 2030;
  //     // Use the updated map_options here
  //   });

  let res = {
    map_config: {
      MAP4D_SECRET_KEY: "fda0ef247812a0f208b654c89a8f9308",
      bearing: "225",
      fax: "02899996889",
      future_time: "2030",
      lat: "21.275684",
      lng: "106.200836",
      past_time: "2000",
      tilt: "62.5",
      time_step: "1",
      type: "roadmap",
      viewbox:
        "21.68368299829859,105.4735689739972,21.981983122929098,105.78599265467678",
      zoom: "19",
    },
  };
  res = res.map_config;
  addCdnMap(res.MAP4D_SECRET_KEY);
  map_options = {
    center: { lat: res.lat, lng: res.lng },
    zoom: parseFloat(res.zoom),
    mapType: res.type,
    controls: false,
    bearing: parseFloat(res.bearing),
    tilt: parseFloat(res.tilt),
  };
  typePOI = res.suggestion ?? [];
  viewBox = res.viewbox;
  keyMap = res.MAP4D_SECRET_KEY;
  pastTime = res.past_time ?? 2000;
  futureTime = res.future_time ?? 2030;
  // Use the updated map_options here
  return map_options;
};

export const getAdressMap4d = async (location) => {
  if (!location?.lat || !location?.lng) return `Vui lòng chọn lại địa điểm`;
  const data = await API().call(
    `https://api-app.map4d.vn/map/geocode?lat=${location.lat}&lng=${location.lng}`
  );
  if (data.code) {
    return data.result.address;
  } else {
    return `${location.lat}, ${location.lng}`;
  }
};

const callDataTypeSearch = async (type) => {
  const res = await fetch(
    `https://api.map4d.vn/sdk/place/viewbox-search?key=${keyMap}&types=${type}&viewbox=${viewBox}`
  );
  return await res.json();
};

export {
  map_options,
  map_options_basic,
  typePOI,
  callOptionsMap,
  callDataTypeSearch,
  fitBounds,
  pastTime,
  futureTime,
  keyMap,
};

const fitBounds = function (
  listBounds,
  map,
  top = 100,
  bottom = 100,
  left = 100,
  right = 100,
  duration = 1000,
  animate = true
) {
  let bounds = new map4d.LatLngBounds();
  listBounds.forEach((el) => {
    bounds.extend(el);
  });
  map.fitBounds(
    bounds,
    { top: top, bottom: bottom, left: left, right: right },
    { duration: duration, animate: animate }
  );
};

export const TextSearchAPIMap4D = async function (searchValue, key = keyMap) {
  try {
    let response = await fetch(
      `https://api.map4d.vn/sdk/autosuggest?key=${key}&text=${searchValue}`
    );
    let data = await response.json();
    return data.result;
  } catch (error) {
    return
  }
};

export const mapFitBoundsDirect = function (list_bounds, map) {
  let bounds = new map4d.LatLngBounds();
  list_bounds.forEach((el) => {
    bounds.extend(el);
  });
  let left_fit = 100;
  map.fitBounds(
    bounds,
    { top: 100, bottom: 100, left: left_fit, right: 100 },
    {
      duration: 1000,
      animate: true,
    }
  );
};

export const mapFitBoundsPoligon = function (path, map) {
  path = path.map((item) => arrayToObjectLatLng(item));
  fitBounds(path, map);
};

export const mapFitBoundsLayerGeoJson = function (
  resGeoJson,
  map,
  type = "Polygon"
) {
  if (!resGeoJson?.features.length) return;
  let bounds = new map4d.LatLngBounds();
  let list_bounds = [];
  for (let features of resGeoJson.features) {
    switch (type) {
      case "MultiPolygon": {
        for (let coordinates of features.geometry.coordinates[0]) {
          for (let item of coordinates) {
            list_bounds = [...list_bounds, arrayToObjectLatLng(item)];
          }
        }
        break;
      }
      default:
        for (let coordinates of features.geometry.coordinates) {
          for (let item of coordinates) {
            list_bounds = [...list_bounds, arrayToObjectLatLng(item)];
          }
        }
    }
  }
  list_bounds.forEach((el) => {
    bounds.extend(el);
  });
  let left_fit = 100;
  map.fitBounds(
    bounds,
    { top: 100, bottom: 100, left: left_fit, right: 100 },
    {
      duration: 1000,
      animate: true,
    }
  );
};

export const decodePolyline = (str, precision) => {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
};
