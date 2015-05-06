var EventEmitter = require('events').EventEmitter
	, util = require('util')
	, http= require('http')
	, https= require('https')
    , URL= require('url')


// set of status codes where we don't attempt reconnects
var STATUS_CODES_TO_ABORT_ON = [ 400, 401, 403, 404, 406, 410, 422 ];

/**
  * Object to request Citations.
 * @constructor
 * @param {String}  method   GET or POST
 * @param {String}  path   	 url
 * @param {String}  params   query params
 */
 
function NCBIRequest (method, path, params) {
  if (method !== 'GET' && method !== 'POST') {
    throw new Error('method `'+method+'` not supported.\n')
  }

  this.method = method
  this.ncbi_options = {}

  // in this part it would be code some about params....
  if (params && params.ncbi_options && typeof params.ncbi_options !== 'object') {
    // invalid `twit_options` specified
    throw new Error('Invalid ncbi_options supplied: '+params.ncbi_options)
  } 

  if (method === 'GET') {
    this.path = path + (params ? '?' + params : '')
    this.params = null
  } else if (method === 'POST') {
    this.path = path
    this.params = params
  }

  EventEmitter.call(this)
}

util.inherits(NCBIRequest, EventEmitter)
/**
 * Send off the HTTP request
 */
NCBIRequest.prototype.makeRequest = function (callback) {
  var action = this.method.toLowerCase();
  var method = this.method;
  var self = this;
  var url = self.path;
  var post_body = null;
  var post_content_type = null;
  

  var parsedUrl= URL.parse( url, false );
  if( parsedUrl.protocol == "http:" && !parsedUrl.port ) parsedUrl.port= 80;
  if( parsedUrl.protocol == "https:" && !parsedUrl.port ) parsedUrl.port= 443;
  var headers= {};
  headers["Host"] = parsedUrl.host

  for( var key in this._headers ) {
    if (this._headers.hasOwnProperty(key)) {
      headers[key]= this._headers[key];
    }
  }
  //This method could change because is not used now...
  if( (method == "POST" || method == "PUT")  && ( post_body == null && extra_params != null) ) {
    // Fix the mismatch between the output of querystring.stringify() and this._encodeData()
    post_body= querystring.stringify(extra_params)
                       .replace(/\!/g, "%21")
                       .replace(/\'/g, "%27")
                       .replace(/\(/g, "%28")
                       .replace(/\)/g, "%29")
                       .replace(/\*/g, "%2A");
  }

  headers["Content-length"]= post_body ? Buffer.byteLength(post_body) : 0;
  headers["Content-Type"]= post_content_type;
   
  var path;
  if( !parsedUrl.pathname  || parsedUrl.pathname == "" ) parsedUrl.pathname ="/";
  if( parsedUrl.query ) path= parsedUrl.pathname + "?"+ parsedUrl.query ;
  else path= parsedUrl.pathname;
  
  var request;
  if( parsedUrl.protocol == "https:" ) {
    request= this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
  }
  else {
    request= this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
  }
  
  
  var callbackCalled= false;
  function passBackControl( response ) {
      if(!callbackCalled) {
        callbackCalled= true;
        if ( response.statusCode >= 200 && response.statusCode <= 299 ) {
          callback(null, data, response);
        } else {
          // Follow 301 or 302 redirects with Location HTTP header
          if((response.statusCode == 301 || response.statusCode == 302) && response.headers && response.headers.location) {
            self._performSecureRequest( oauth_token, oauth_token_secret, method, response.headers.location, extra_params, post_body, post_content_type,  callback);
          }
          else {
            callback({ statusCode: response.statusCode, data: data }, data, response);
          }
        }
      }
    }
    
    var data=""; 
    var self= this;
  	  request.on('response', function (response) {
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        data+=chunk;
      });
      response.on('end', function () {
        passBackControl( response );
      });
      response.on('close', function () {
        if( allowEarlyClose ) {
          passBackControl( response );
        }
      });
    });
  
    request.on("error", function(err) {
      callbackCalled= true;
      callback( err )
    });
    
    if( (method == "POST" || method =="PUT") && post_body != null && post_body != "" ) {
      request.write(post_body);
    }
    request.end();
  	
  
  return;
}


NCBIRequest.prototype._createClient= function( port, hostname, method, path, headers, sslEnabled ) {
  var options = {
    host: hostname,
    port: port,
    path: path,
    method: method,
    headers: headers
  };
  var httpModel;
  if( sslEnabled ) {
    httpModel= https;
  } else {
    httpModel= http;
  }
  return httpModel.request(options);     
}

/**
 * NCBIRequest module.
 * @module NCBIRequest
 */
module.exports = NCBIRequest

