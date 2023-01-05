class LibHelper {

  static EARTH_RADIUS_M = 6371000;
  static EARTH_RADIUS_KM = 6371;
  static EARTH_RADIUS_MILES = 3959; // 3958.756 || 3959 || 3963

  static setErrMsg(msg) {
    if (process.env.NODE_ENV == 'development') {
      return msg;
    }
    return '';
  }

  /**
   * Calculates the great-circle distance between two points, with
   * the Haversine formula.
   * @param float latitudeFrom Latitude of start point in [deg decimal]
   * @param float longitudeFrom Longitude of start point in [deg decimal]
   * @param float latitudeTo Latitude of target point in [deg decimal]
   * @param float longitudeTo Longitude of target point in [deg decimal]
   * @param float earthRadius Mean earth radius in [m]
   * @return float Distance between points in [m] (same as earthRadius)
   * reference: https://stackoverflow.com/questions/14750275/haversine-formula-with-php
   * tolak ukur: tarik garis lurus
   * more accurate using km/meters than miles i think ~ rafifmulia
   */
  static haversineGreatCircleDistance(latFrom, lngFrom, latTo, lngTo, earthRadius = LibHelper.EARTH_RADIUS_M) {
    // convert from degrees to radians
    let latFromRads = LibHelper.degsToRads(latFrom);
    let lngFromRads = LibHelper.degsToRads(lngFrom);
    let latToRads = LibHelper.degsToRads(latTo);
    let lngToRads = LibHelper.degsToRads(lngTo);

    let latDelta = latToRads - latFromRads;
    let lngDelta = lngToRads - lngFromRads;

    let angle = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latDelta / 2), 2) + Math.cos(latFromRads) * Math.cos(latToRads) * Math.pow(Math.sin(lngDelta / 2), 2)));
    let distance = angle * earthRadius;

    return distance;
  }

  // reference: https://www.codegrepper.com/code-examples/javascript/deg2rad+javascript
  // degrees to radians
  static degsToRads(deg) {
    return (deg * Math.PI) / 180.0;
  }
  // radians to degrees
  static radsToDegs(rad) {
    return rad * 180.0 / Math.PI;
  }

  // round up with precisions digits => 4 == (10000)
  // reference: https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
  static milesToKm(miles, precisionDigits = 10000) {
    return Math.round(((miles * 1.609) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static milesToMeters(miles, precisionDigits = 10000) {
    return Math.round(((miles * 1609) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static milesToMiles(meters, precisionDigits = 10000) {
    return Math.round(((meters) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static kmToMiles(km, precisionDigits = 10000) {
    return Math.round(((km / 1.609) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static kmToMeters(km, precisionDigits = 10000) {
    return Math.round(((km * 1000) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static kmToKm(meters, precisionDigits = 10000) {
    return Math.round(((meters) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static metersToKm(meters, precisionDigits = 10000) {
    return Math.round(((meters / 1000) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static metersToMiles(meters, precisionDigits = 10000) {
    return Math.round(((meters / 1609) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }
  static metersToMeters(meters, precisionDigits = 10000) {
    return Math.round(((meters) + Number.EPSILON) * precisionDigits) / precisionDigits;
  }

  static hex2bin(hex) {
    return ("00000000" + (parseInt(hex, 16)).toString(2)).slice(-8);
  }

  static splitEvery4Char(str) {
    if (str) {
      str = '' + str;
      let splitEvery4Char = str.match(/.{1,4}/g)
      return splitEvery4Char.join(' ')
    }
    return '';
  }
};

module.exports = LibHelper;