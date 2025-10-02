/**
 * Google Maps Configuration
 */

export const GOOGLE_MAPS_CONFIG = {
  // Get your API key from: https://console.cloud.google.com/google/maps-apis
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // Map libraries to load
  libraries: ['places', 'drawing', 'geometry'] as const,

  // Default map options
  defaultCenter: {
    lat: 39.8283, // Center of USA
    lng: -98.5795,
  },

  defaultZoom: 4,

  // Map styles (optional - can be customized)
  mapStyles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],

  // Agriculture-specific map types
  mapTypeIds: {
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain',
    ROADMAP: 'roadmap',
  } as const,
};

/**
 * Check if Google Maps is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return !!GOOGLE_MAPS_CONFIG.apiKey;
}

/**
 * Get map options for different contexts
 */
export function getMapOptions(type: 'farm' | 'field' | 'node') {
  const baseOptions = {
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: [
        GOOGLE_MAPS_CONFIG.mapTypeIds.SATELLITE,
        GOOGLE_MAPS_CONFIG.mapTypeIds.HYBRID,
        GOOGLE_MAPS_CONFIG.mapTypeIds.TERRAIN,
        GOOGLE_MAPS_CONFIG.mapTypeIds.ROADMAP,
      ],
    },
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: GOOGLE_MAPS_CONFIG.mapStyles,
  };

  switch (type) {
    case 'farm':
      return {
        ...baseOptions,
        mapTypeId: GOOGLE_MAPS_CONFIG.mapTypeIds.SATELLITE,
        zoom: 12,
      };
    case 'field':
      return {
        ...baseOptions,
        mapTypeId: GOOGLE_MAPS_CONFIG.mapTypeIds.HYBRID,
        zoom: 16,
      };
    case 'node':
      return {
        ...baseOptions,
        mapTypeId: GOOGLE_MAPS_CONFIG.mapTypeIds.HYBRID,
        zoom: 18,
      };
    default:
      return baseOptions;
  }
}
