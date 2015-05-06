var NCBIRequest = require('./lib/ncbirequest'),
	NCBIConf = require('./lib/ncbiconf')

var ncbiconf = new NCBIConf();

/**
 * Object to do differnt actions in Citations.
 * @constructor
 */
var Citation = function () {
 	this.ncbiconf = ncbiconf;
}

// This first version only set up the get function....
// Write in this class the different functions PUT, DELETE, etc.

/**
 * Citation module.
 * @module Citation
 */
Citation.prototype = {
 /**
 * GET any API endpoints.
 * @param {string} type - NCBI endpoints (e.g. esearch).
 * @param {string} params - keyword separated by commas. 
 * @param {function} callback - data is the parsed data received from NCBI.
 * @memberOf  Citation
 */
  get: function (type, params, callback) {
    return this.request('GET', type, params, callback)
  },
   /**
 * Use NCBIRequest object to get NCBI API requests.
 * @param {string} method -  Request: GET, PUT, DELETE
 * @param {string} type - NCBI endpoints (e.g. esearch).
 * @param {string} params - keyword separated by commas. 
 * @param {function} callback - - data is the parsed data received from NCBI.
 * @memberOf  Citation
 */
  request: function (method, type, params, callback) {

    params = this.ncbiconf.params(type,params);
    //console.log(params);
    // build the full url
    var finalPath = this.ncbiconf.path(type);
	//console.log(finalPath);
    return new NCBIRequest(
      	method
      , finalPath	
      , params
    ).makeRequest(callback)
  }
}
 module.exports = Citation
