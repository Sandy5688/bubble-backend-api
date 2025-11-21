const geoip = require('geoip-lite');
const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Region Context Detector Middleware
 * Runs on EVERY incoming request (web + mobile API)
 * 
 * Detection Priority:
 * 1. Cloudflare CF-IPCountry header (fastest, most reliable)
 * 2. MaxMind GeoLite2 free DB (IP-based)
 * 3. GPS coordinates from mobile (X-GPS-Lat-Long header)
 * 
 * Attaches req.context with region information
 */

// State mapping for region codes
const STATE_MAPPINGS = {
  // Australia
  'New South Wales': 'NSW',
  'Victoria': 'VIC',
  'Queensland': 'QLD',
  'South Australia': 'SA',
  'Western Australia': 'WA',
  'Tasmania': 'TAS',
  'Northern Territory': 'NT',
  'Australian Capital Territory': 'ACT',
  
  // USA (common states)
  'California': 'CA',
  'New York': 'NY',
  'Texas': 'TX',
  'Florida': 'FL',
  // Add more as needed
};

/**
 * Method 1: Cloudflare detection (fastest)
 */
function detectFromCloudflare(req) {
  const countryCode = req.headers['cf-ipcountry'];
  
  if (countryCode && countryCode !== 'XX') {
    logger.info('Region detected via Cloudflare', { countryCode });
    return {
      countryCode: countryCode.toUpperCase(),
      regionCode: null, // Cloudflare doesn't provide subdivision
      detectedBy: 'cloudflare'
    };
  }
  
  return null;
}

/**
 * Method 2: MaxMind/GeoIP-Lite detection (fallback)
 */
function detectFromMaxMind(req) {
  // Get IP address (handle proxies)
  const ip = req.headers['cf-connecting-ip'] || 
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress;

  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return null;
  }

  const geo = geoip.lookup(ip);
  
  if (geo) {
    const countryCode = geo.country;
    let regionCode = null;
    
    // Get region/state if available
    if (geo.region) {
      regionCode = STATE_MAPPINGS[geo.region] || geo.region;
    }
    
    logger.info('Region detected via MaxMind', { ip, countryCode, regionCode });
    
    return {
      countryCode,
      regionCode,
      detectedBy: 'maxmind'
    };
  }
  
  return null;
}

/**
 * Method 3: GPS reverse geocoding (mobile only, slowest)
 */
async function detectFromGPS(req) {
  const gpsHeader = req.headers['x-gps-lat-long'];
  
  if (!gpsHeader) {
    return null;
  }

  try {
    const [lat, lon] = gpsHeader.split(',').map(s => parseFloat(s.trim()));
    
    if (isNaN(lat) || isNaN(lon)) {
      logger.warn('Invalid GPS coordinates', { gpsHeader });
      return null;
    }

    // Use free reverse geocoding API (nominatim)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        timeout: 2000, // 2 second timeout
        headers: {
          'User-Agent': 'BubbleBackendAPI/1.0'
        }
      }
    );

    const address = response.data?.address;
    
    if (address) {
      const countryCode = address.country_code?.toUpperCase();
      let regionCode = null;
      
      // Try to get state/region
      if (address.state) {
        regionCode = STATE_MAPPINGS[address.state] || address.state;
      }
      
      logger.info('Region detected via GPS', { lat, lon, countryCode, regionCode });
      
      return {
        countryCode,
        regionCode,
        detectedBy: 'gps'
      };
    }
  } catch (error) {
    logger.error('GPS reverse geocoding failed', { error: error.message });
  }
  
  return null;
}

/**
 * Main middleware function
 */
async function regionDetector(req, res, next) {
  try {
    let context = null;

    // Try detection methods in priority order
    context = detectFromCloudflare(req);
    
    if (!context) {
      context = detectFromMaxMind(req);
    }
    
    if (!context && req.headers['x-gps-lat-long']) {
      context = await detectFromGPS(req);
    }

    // Absolute fallback
    if (!context) {
      context = {
        countryCode: 'XX',
        regionCode: null,
        detectedBy: 'fallback'
      };
      logger.warn('Region detection failed, using fallback', {
        ip: req.ip,
        headers: req.headers
      });
    }

    // Attach to request
    req.context = context;

    // Add response header for frontend
    const regionHeader = context.regionCode 
      ? `${context.countryCode}-${context.regionCode}`
      : context.countryCode;
    
    res.setHeader('X-Vogue-Region', regionHeader);

    next();
  } catch (error) {
    logger.error('Region detector middleware error', { error });
    
    // Fail gracefully with fallback
    req.context = {
      countryCode: 'XX',
      regionCode: null,
      detectedBy: 'error'
    };
    
    res.setHeader('X-Vogue-Region', 'XX');
    next();
  }
}

module.exports = regionDetector;
