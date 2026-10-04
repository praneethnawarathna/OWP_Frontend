/**
 * Built-in list of ~80 well-known Sri Lankan towns, cities and tourist areas.
 * Used as last-resort fallback when every online geocoding service fails.
 *
 * Coordinates are approximate town-centre locations.
 */
export const SRI_LANKA_PLACES = [
  // All 25 district capitals
  { name: 'Colombo',        district: 'Colombo',        lat: 6.9271,  lng: 79.8612 },
  { name: 'Kandy',          district: 'Kandy',          lat: 7.2906,  lng: 80.6337 },
  { name: 'Galle',          district: 'Galle',          lat: 6.0535,  lng: 80.2210 },
  { name: 'Jaffna',         district: 'Jaffna',         lat: 9.6615,  lng: 80.0255 },
  { name: 'Trincomalee',    district: 'Trincomalee',    lat: 8.5874,  lng: 81.2152 },
  { name: 'Anuradhapura',   district: 'Anuradhapura',   lat: 8.3114,  lng: 80.4037 },
  { name: 'Polonnaruwa',    district: 'Polonnaruwa',    lat: 7.9403,  lng: 81.0188 },
  { name: 'Kurunegala',     district: 'Kurunegala',     lat: 7.4863,  lng: 80.3647 },
  { name: 'Ratnapura',      district: 'Ratnapura',      lat: 6.6828,  lng: 80.3992 },
  { name: 'Matara',         district: 'Matara',         lat: 5.9549,  lng: 80.5550 },
  { name: 'Badulla',        district: 'Badulla',        lat: 6.9895,  lng: 81.0557 },
  { name: 'Batticaloa',     district: 'Batticaloa',     lat: 7.7102,  lng: 81.6924 },
  { name: 'Kalutara',       district: 'Kalutara',       lat: 6.5854,  lng: 79.9607 },
  { name: 'Kegalle',        district: 'Kegalle',        lat: 7.2513,  lng: 80.3464 },
  { name: 'Kilinochchi',    district: 'Kilinochchi',    lat: 9.3803,  lng: 80.3990 },
  { name: 'Mannar',         district: 'Mannar',         lat: 8.9810,  lng: 79.9044 },
  { name: 'Matale',         district: 'Matale',         lat: 7.4675,  lng: 80.6234 },
  { name: 'Monaragala',     district: 'Monaragala',     lat: 6.8728,  lng: 81.3504 },
  { name: 'Mullaitivu',     district: 'Mullaitivu',     lat: 9.2671,  lng: 80.8128 },
  { name: 'Nuwara Eliya',   district: 'Nuwara Eliya',   lat: 6.9497,  lng: 80.7891 },
  { name: 'Polonnaruwa',    district: 'Polonnaruwa',    lat: 7.9403,  lng: 81.0188 },
  { name: 'Puttalam',       district: 'Puttalam',       lat: 8.0362,  lng: 79.8283 },
  { name: 'Vavuniya',       district: 'Vavuniya',       lat: 8.7514,  lng: 80.4971 },
  { name: 'Hambantota',     district: 'Hambantota',     lat: 6.1241,  lng: 81.1185 },
  { name: 'Ampara',         district: 'Ampara',         lat: 7.2986,  lng: 81.6700 },

  // Popular tourist areas, suburbs and landmarks
  { name: 'Peradeniya',     district: 'Kandy',          lat: 7.2673,  lng: 80.5958 },
  { name: 'Ella',           district: 'Badulla',        lat: 6.8667,  lng: 81.0465 },
  { name: 'Sigiriya',       district: 'Matale',         lat: 7.9570,  lng: 80.7603 },
  { name: 'Dambulla',       district: 'Matale',         lat: 7.8742,  lng: 80.6517 },
  { name: 'Negombo',        district: 'Gampaha',        lat: 7.2081,  lng: 79.8358 },
  { name: 'Bentota',        district: 'Galle',          lat: 6.4267,  lng: 79.9960 },
  { name: 'Mirissa',        district: 'Matara',         lat: 5.9483,  lng: 80.4613 },
  { name: 'Unawatuna',      district: 'Galle',          lat: 6.0164,  lng: 80.2493 },
  { name: 'Hikkaduwa',      district: 'Galle',          lat: 6.1395,  lng: 80.1065 },
  { name: 'Arugam Bay',     district: 'Ampara',         lat: 6.8389,  lng: 81.8360 },
  { name: 'Nuwara Eliya',   district: 'Nuwara Eliya',   lat: 6.9497,  lng: 80.7891 },
  { name: 'Haputale',       district: 'Badulla',        lat: 6.7680,  lng: 80.9593 },
  { name: 'Bandarawela',    district: 'Badulla',        lat: 6.8320,  lng: 80.9891 },
  { name: 'Tissamaharama',  district: 'Hambantota',     lat: 6.2841,  lng: 81.2871 },
  { name: 'Weligama',       district: 'Matara',         lat: 5.9733,  lng: 80.4292 },
  { name: 'Tangalle',       district: 'Hambantota',     lat: 6.0258,  lng: 80.7958 },
  { name: 'Dikwella',       district: 'Matara',         lat: 5.9696,  lng: 80.7021 },
  { name: 'Ambalangoda',    district: 'Galle',          lat: 6.2332,  lng: 80.0534 },
  { name: 'Chilaw',         district: 'Puttalam',       lat: 7.5761,  lng: 79.7956 },
  { name: 'Moratuwa',       district: 'Colombo',        lat: 6.7731,  lng: 79.8811 },
  { name: 'Dehiwala',       district: 'Colombo',        lat: 6.8513,  lng: 79.8645 },
  { name: 'Mount Lavinia',  district: 'Colombo',        lat: 6.8380,  lng: 79.8640 },
  { name: 'Sri Jayawardenepura Kotte', district: 'Colombo', lat: 6.8876, lng: 79.9019 },
  { name: 'Battaramulla',   district: 'Colombo',        lat: 6.9060,  lng: 79.9222 },
  { name: 'Rajagiriya',     district: 'Colombo',        lat: 6.9020,  lng: 79.8924 },
  { name: 'Maharagama',     district: 'Colombo',        lat: 6.8490,  lng: 79.9283 },
  { name: 'Piliyandala',    district: 'Colombo',        lat: 6.8006,  lng: 79.9243 },
  { name: 'Kaduwela',       district: 'Colombo',        lat: 6.9356,  lng: 79.9835 },
  { name: 'Gampaha',        district: 'Gampaha',        lat: 7.0873,  lng: 80.0001 },
  { name: 'Ja-Ela',         district: 'Gampaha',        lat: 7.0734,  lng: 79.8910 },
  { name: 'Wattala',        district: 'Gampaha',        lat: 6.9931,  lng: 79.8913 },
  { name: 'Panadura',       district: 'Kalutara',       lat: 6.7128,  lng: 79.9038 },
  { name: 'Beruwala',       district: 'Kalutara',       lat: 6.4778,  lng: 79.9823 },
  { name: 'Aluthgama',      district: 'Kalutara',       lat: 6.4340,  lng: 79.9966 },
  { name: 'Embilipitiya',   district: 'Ratnapura',      lat: 6.3437,  lng: 80.8462 },
  { name: 'Hatton',         district: 'Nuwara Eliya',   lat: 6.8925,  lng: 80.5965 },
  { name: 'Katunayake',     district: 'Gampaha',        lat: 7.1696,  lng: 79.8826 },
  { name: 'Minuwangoda',    district: 'Gampaha',        lat: 7.1652,  lng: 79.9545 },
  { name: 'Kuliyapitiya',   district: 'Kurunegala',     lat: 7.4670,  lng: 80.0418 },
  { name: 'Nikaweratiya',   district: 'Kurunegala',     lat: 7.7272,  lng: 80.1232 },
  { name: 'Warakapola',     district: 'Kegalle',        lat: 7.2600,  lng: 80.2022 },
  { name: 'Avissawella',    district: 'Colombo',        lat: 6.9465,  lng: 80.2112 },
  { name: 'Horana',         district: 'Kalutara',       lat: 6.7148,  lng: 80.0614 },
  { name: 'Hanwella',       district: 'Colombo',        lat: 6.9043,  lng: 80.0815 },
  { name: 'Nattandiya',     district: 'Puttalam',       lat: 7.4307,  lng: 79.8529 },
  { name: 'Polgahawela',    district: 'Kurunegala',     lat: 7.3352,  lng: 80.2748 },
  { name: 'Maho',           district: 'Kurunegala',     lat: 7.9019,  lng: 80.2800 },
  { name: 'Galgamuwa',      district: 'Kurunegala',     lat: 8.1013,  lng: 80.3126 },
  { name: 'Medirigiriya',   district: 'Polonnaruwa',    lat: 7.9944,  lng: 81.1025 },
  { name: 'Minneriya',      district: 'Polonnaruwa',    lat: 8.0328,  lng: 80.8975 },
  { name: 'Habarana',       district: 'Anuradhapura',   lat: 8.0484,  lng: 80.7483 },
  { name: 'Mihintale',      district: 'Anuradhapura',   lat: 8.3507,  lng: 80.5061 },
  { name: 'Kekirawa',       district: 'Anuradhapura',   lat: 8.0270,  lng: 80.5906 },
  { name: 'Valachchenai',   district: 'Batticaloa',     lat: 7.9978,  lng: 81.5493 },
  { name: 'Kalmunai',       district: 'Ampara',         lat: 7.4162,  lng: 81.8337 },
  { name: 'Dehiaththakandiya', district: 'Ampara',      lat: 7.7002,  lng: 81.1984 },
  { name: 'Pottuvil',       district: 'Ampara',         lat: 6.8728,  lng: 81.8334 },
  { name: 'Nainativu',      district: 'Jaffna',         lat: 9.5432,  lng: 79.7686 },
  { name: 'Point Pedro',    district: 'Jaffna',         lat: 9.8240,  lng: 80.2351 },
  { name: 'Chavakachcheri', district: 'Jaffna',         lat: 9.6481,  lng: 80.1693 },
];

/**
 * Search the built-in list for places matching the query.
 * Priority: startsWith first, then includes.
 * Returns up to 5 results of shape { label, lat, lng, source }.
 */
export function searchBuiltIn(query) {
  if (!query || query.trim() === '') return [];

  const q = normalise(query);

  const startsWith = [];
  const includes_ = [];

  for (const place of SRI_LANKA_PLACES) {
    const nameN = normalise(place.name);
    const distN = normalise(place.district);

    if (nameN.startsWith(q) || distN.startsWith(q)) {
      startsWith.push(place);
    } else if (nameN.includes(q) || distN.includes(q)) {
      includes_.push(place);
    }
  }

  // Deduplicate by name (can appear twice if different coords)
  const seen = new Set();
  const combined = [];
  for (const p of [...startsWith, ...includes_]) {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      combined.push(p);
    }
  }

  return combined.slice(0, 5).map((p) => ({
    label: `${p.name}, ${p.district} (approximate)`,
    lat: p.lat,
    lng: p.lng,
    source: 'built-in',
  }));
}

function normalise(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .trim();
}
