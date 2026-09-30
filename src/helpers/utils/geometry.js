export function validateCoordinates(coordinates) {
  var coordinateArray = coordinates.split(","); // Tách chuỗi thành mảng các thành phần

  if (coordinateArray.length === 2) {
    var latitude = parseFloat(coordinateArray[0].trim()); // Lấy giá trị latitude
    var longitude = parseFloat(coordinateArray[1].trim()); // Lấy giá trị longitude

    // Kiểm tra giá trị latitude và longitude
    if (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return true;
    }
  }

  return false;
}

export function convertLatLngToPointGeoJson(lat, lng) {
  return JSON.stringify({
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            parseFloat(lng),
            parseFloat(lat)
          ],
          "type": "Point"
        }
      }
    ]
  })
}

export function convertPointGeoJsonToLatLng(geoJson) {
  try {
    if (geoJson == undefined) return
    const lat = geoJson.coordinates[0];
    const lng = geoJson.coordinates[1];
    return [lat, lng]
  }
  catch {
    return [0, 0]
  }

}

/**
 * Extracts latitude and longitude coordinates from a string.
 * @param {string} input - "SRID=4326;POINT (16.072864536022138 108.23587467665931)"
 * @returns {Array<number>|null} - An array with latitude and longitude coordinates, or null if the coordinates were not found.
 */
export function extractCoordinates(input) {
  // Extract the coordinates from the input string
  const regex = /POINT \(([-0-9.]+) ([-0-9.]+)\)/;
  const matches = regex.exec(input);

  // Check if coordinates were found
  if (matches && matches.length === 3) {
    const latitude = parseFloat(matches[1]);
    const longitude = parseFloat(matches[2]);

    // Return the coordinates as an array
    return [latitude, longitude];
  } else {
    // Return null if coordinates were not found
    return null;
  }
}

export function validatePolygonGeoJson(data) {
  try {
    const parsedData = JSON.parse(data);

    // Kiểm tra kiểu dữ liệu
    if (parsedData.type !== 'FeatureCollection' || !Array.isArray(parsedData.features)) {
      return false;
    }

    // Kiểm tra cấu trúc của geometry
    const { features } = parsedData;
    for (const feature of features) {
      if (
        feature.type !== 'Feature' ||
        !feature.geometry ||
        feature.geometry.type !== 'Polygon' ||
        !Array.isArray(feature.geometry.coordinates)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function getVietNamLatLng(lat, lng) {
  let tmpLat = lat
  if (lat > lng) {
    lat = lng
    lng = tmpLat
  }
  return {
    lat: lat,
    lng: lng
  }

}