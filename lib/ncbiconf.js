//
//  Setup path and parameters.
//


//  Endpoints for different NCBI API options
var EInfo_ROOT = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi',
 	ESearch_ROOT = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
 	EPost_ROOT = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/epost.fcgi',
 	ESummary_ROOT = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
 	EFetch_ROOT = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'

// version has changed from 1.0 to 2.0, is important add the version at the end of query
// filter is the Search Field that get citation information. Includes all words and numbers in the title, 
// abstract and article body, as well as in table and figure captions and in the article reference section.
// db by default is PublicMed Central. It can be parameterised for distinct dbs. 
  
var version = 'version=2.0',
	filter = '[text word]',
	db = 'db=pmc',
	query = 'term='

/**
 * Endpoints configuration and access.
 * @constructor
 */

var NCBIConf = function () {
 
}

NCBIConf.prototype = {
 /**
 * Get the specific endpoint.
 * @param {string} type - NCBI endpoints (e.g. esearch).
 * @memberOf  NCBIConf
 */
  path: function (type) {
    return getPath(type);
  },
   /**
 * Obtain the correct parameters syntax.
 * @param {string} type - NCBI endpoints (e.g. esearch).
 * @memberOf  NCBIConf
 */
  params: function (type, params) {
    return getParams(type, params);
  }
  
};
/**
 * NCBIConf module.
 * @module NCBIConf
 */
module.exports = NCBIConf

function getPath(type){
	switch (type) {
    case "einfo":
        return EInfo_ROOT;
    case "esearch":
        return ESearch_ROOT;
    case "epost":
        return EPost_ROOT;
    case "esummary":
        return ESummary_ROOT;
    case "efetch":
        return EFetch_ROOT;
 }   
};

// This version only suport esearch parameters
function getParams(type, params){
	switch (type) {
		case "einfo":
			return db+'&'+query+params+filter+'&'+version; // must change
		case "esearch":
			return db+'&'+query+getParametersFormat(params, filter)+'&'+version;
		case "epost":
			return db+'&'+getParametersFormat(params, filter)+'&'+version; // must change
		case "esummary":
			return db+'&'+getParametersFormat(params, filter)+'&'+version; // must change
		case "efetch":
			return db+'&'+getParametersFormat(params, filter)+'&'+version; // must change
	}
    
};

function getParametersFormat(params, filter){
	var paramsFormated = '(' + params.replace(/;/g, filter+") AND (")  + filter+')';
	paramsFormated = paramsFormated.replace(/,/g, filter+" OR ");
	//console.log(paramsFormated);
	return paramsFormated;	

}

