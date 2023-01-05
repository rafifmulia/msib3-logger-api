const request = {
	osm_reverse_geo: {
		urlBase: 'https://nominatim.openstreetmap.org',
		urlPath: 'reverse',
		urlFull: 'https://nominatim.openstreetmap.org/reverse',
		method: 'GET',
		payload: {
			format: 'geojson' // xml,json,jsonv2,geojson(prefer),geocodejson
		},
	},
};
  
module.exports = request;