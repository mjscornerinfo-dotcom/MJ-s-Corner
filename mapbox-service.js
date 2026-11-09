/**
 * Mapbox Distance & Delivery Fee Calculation Service for MJ's Corner
 * Handles Geocoding (Address -> Coordinates) and Directions Routing (Driving Distance & ETA)
 */

const https = require('https');

// In-memory caches to minimize external API roundtrips
const geocodeCache = new Map();
const routeCache = new Map();

function getMapboxToken() {
  return process.env.MAPBOX_ACCESS_TOKEN || '';
}

/**
 * Perform HTTPS GET request with JSON parsing
 */
function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse Mapbox response: ${body.slice(0, 100)}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Forward Geocode an address string to [longitude, latitude]
 * Uses proximity biasing toward the store location in Assam
 */
async function geocodeAddress(addressText, proximity = [91.06468, 26.40268]) {
  if (!addressText || typeof addressText !== 'string' || !addressText.trim()) {
    return { success: false, message: 'Address is required for distance calculation' };
  }

  const token = getMapboxToken();
  if (!token) {
    return { success: false, message: 'Mapbox token is not configured on server' };
  }

  const cleanQuery = addressText.trim().replace(/\s+/g, ' ');
  const cacheKey = cleanQuery.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    // If query does not mention Assam or India, append Assam, India for better local resolution
    let enhancedQuery = cleanQuery;
    if (!/assam/i.test(enhancedQuery) && !/india/i.test(enhancedQuery)) {
      enhancedQuery += ', Assam, India';
    }

    const encoded = encodeURIComponent(enhancedQuery);
    const [proxLng, proxLat] = proximity;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=in&proximity=${proxLng},${proxLat}&limit=3`;

    const { status, data } = await httpsGetJson(url);
    if (status !== 200 || !data.features || data.features.length === 0) {
      // Fallback try without appended suffix
      const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${token}&country=in&proximity=${proxLng},${proxLat}&limit=1`;
      const fallbackRes = await httpsGetJson(fallbackUrl);
      if (fallbackRes.status === 200 && fallbackRes.data.features && fallbackRes.data.features.length > 0) {
        const feat = fallbackRes.data.features[0];
        const res = {
          success: true,
          coordinates: feat.center, // [lng, lat]
          placeName: feat.place_name,
          relevance: feat.relevance
        };
        geocodeCache.set(cacheKey, res);
        return res;
      }

      return { success: false, message: `Could not pinpoint location for '${addressText}'. Please include village/town or PIN.` };
    }

    const feature = data.features[0];
    const result = {
      success: true,
      coordinates: feature.center, // [lng, lat]
      placeName: feature.place_name,
      relevance: feature.relevance
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Mapbox Geocode Error]:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Reverse Geocode coordinates [longitude, latitude] to a readable address string
 */
async function reverseGeocode(lng, lat) {
  const numLng = parseFloat(lng);
  const numLat = parseFloat(lat);
  if (isNaN(numLng) || isNaN(numLat)) {
    return { success: false, message: 'Invalid coordinates for reverse geocoding' };
  }

  const token = getMapboxToken();
  if (!token) {
    return { success: false, message: 'Mapbox token is not configured on server' };
  }

  const cacheKey = `rev_${numLng.toFixed(5)}_${numLat.toFixed(5)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${numLng},${numLat}.json?access_token=${token}`;
    const { status, data } = await httpsGetJson(url);

    if (status !== 200 || !data.features || data.features.length === 0) {
      return { success: false, message: 'No address could be found for these coordinates' };
    }

    const addressFeat = data.features.find(f => f.place_type && f.place_type.includes('address'));
    const localityFeat = data.features.find(f => f.place_type && (f.place_type.includes('locality') || f.place_type.includes('neighborhood')));
    const placeFeat = data.features.find(f => f.place_type && f.place_type.includes('place'));

    const placeName = (addressFeat && addressFeat.place_name) ||
                      (localityFeat && localityFeat.place_name) ||
                      (placeFeat && placeFeat.place_name) ||
                      data.features[0].place_name;

    const shortName = (localityFeat && localityFeat.text) ||
                      (placeFeat && placeFeat.text) ||
                      (addressFeat && addressFeat.text) ||
                      data.features[0].text;

    const result = {
      success: true,
      placeName: placeName,
      shortName: shortName,
      coordinates: [numLng, numLat],
      features: data.features.map(f => ({ name: f.place_name, type: f.place_type }))
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Mapbox Reverse Geocode Error]:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Calculate driving distance and duration via Mapbox Directions API
 * Origin and Destination must be [lng, lat]
 */
async function getDrivingDistance(originCoords, destCoords) {
  const token = getMapboxToken();
  if (!token) {
    return { success: false, message: 'Mapbox token is not configured on server' };
  }

  const origStr = `${originCoords[0].toFixed(5)},${originCoords[1].toFixed(5)}`;
  const destStr = `${destCoords[0].toFixed(5)},${destCoords[1].toFixed(5)}`;
  const cacheKey = `${origStr};${destStr}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=${token}&geometries=geojson&overview=simplified`;
    const { status, data } = await httpsGetJson(url);

    if (status !== 200 || !data.routes || data.routes.length === 0) {
      return { success: false, message: 'No driving route found to this location' };
    }

    const route = data.routes[0];
    const distanceMeters = route.distance;
    const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
    const durationSeconds = route.duration;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    const result = {
      success: true,
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes
    };

    routeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Mapbox Directions Error]:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Compute delivery fee based on driving distance and store pricing configuration
 * Rule:
 * 0 - 2.2 km = ₹20
 * Additional km beyond 2.2 km = ₹15/km
 */
function computeDeliveryFee(distanceKm, subtotal = 0, config = {}) {
  const baseFee = config.baseFee !== undefined ? config.baseFee : 20;
  const baseDistanceKm = config.baseDistanceKm !== undefined ? config.baseDistanceKm : 2.2;
  const perKmFee = config.perKmFee !== undefined ? config.perKmFee : 15;
  const maxDeliveryRadiusKm = config.maxDeliveryRadiusKm !== undefined ? config.maxDeliveryRadiusKm : 15.0;
  const freeDeliveryThreshold = config.freeDeliveryThreshold || 0;

  let fee = baseFee;
  let inRange = true;

  if (distanceKm > maxDeliveryRadiusKm) {
    inRange = false;
  }

  if (distanceKm > baseDistanceKm) {
    const extraKm = distanceKm - baseDistanceKm;
    fee = baseFee + Math.round(extraKm * perKmFee);
  }

  let isFreeDelivery = false;
  if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold && inRange) {
    fee = 0;
    isFreeDelivery = true;
  }

  return {
    fee,
    distanceKm,
    inRange,
    isFreeDelivery,
    baseFee,
    baseDistanceKm,
    perKmFee,
    maxDeliveryRadiusKm
  };
}

/**
 * High-level helper: takes customer address or coordinates and calculates full delivery report
 */
async function calculateDeliveryForAddress({
  address,
  coordinates,
  subtotal = 0,
  storeLocation,
  config
}) {
  const storeCoords = [
    (storeLocation && storeLocation.longitude !== undefined) ? storeLocation.longitude : 91.06468429950438,
    (storeLocation && storeLocation.latitude !== undefined) ? storeLocation.latitude : 26.402688880316525
  ];

  let destCoords = coordinates;
  let formattedAddress = address || '';

  // If coordinates not already provided, geocode the address
  if (Array.isArray(destCoords) && destCoords.length === 2) {
    if (!formattedAddress || formattedAddress.trim() === 'Current Location') {
      const rev = await reverseGeocode(destCoords[0], destCoords[1]);
      if (rev.success && rev.placeName) {
        formattedAddress = rev.placeName;
      }
    }
  } else {
    const geoRes = await geocodeAddress(address, storeCoords);
    if (!geoRes.success) {
      // Fallback
      const fallbackFee = (config && config.fallbackFee !== undefined) ? config.fallbackFee : 50;
      return {
        success: false,
        message: geoRes.message || 'Could not locate address',
        deliveryFee: fallbackFee,
        distanceKm: null,
        durationMinutes: null,
        isFallback: true,
        inRange: true
      };
    }
    destCoords = geoRes.coordinates;
    formattedAddress = geoRes.placeName || address;
  }

  // Calculate driving route
  const routeRes = await getDrivingDistance(storeCoords, destCoords);
  if (!routeRes.success) {
    const fallbackFee = (config && config.fallbackFee !== undefined) ? config.fallbackFee : 50;
    return {
      success: false,
      message: routeRes.message || 'Could not calculate road route',
      deliveryFee: fallbackFee,
      distanceKm: null,
      durationMinutes: null,
      isFallback: true,
      inRange: true
    };
  }

  // Compute fee
  const feeInfo = computeDeliveryFee(routeRes.distanceKm, subtotal, config);

  return {
    success: true,
    distanceKm: routeRes.distanceKm,
    durationMinutes: routeRes.durationMinutes,
    deliveryFee: feeInfo.fee,
    inRange: feeInfo.inRange,
    deliverable: feeInfo.inRange,
    isFreeDelivery: feeInfo.isFreeDelivery,
    maxDeliveryRadiusKm: feeInfo.maxDeliveryRadiusKm,
    formattedAddress,
    resolvedAddress: formattedAddress,
    coordinates: destCoords,
    breakdown: {
      baseFee: feeInfo.baseFee,
      baseDistanceKm: feeInfo.baseDistanceKm,
      perKmFee: feeInfo.perKmFee,
      distanceKm: routeRes.distanceKm
    }
  };
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getDrivingDistance,
  computeDeliveryFee,
  calculateDeliveryForAddress
};
