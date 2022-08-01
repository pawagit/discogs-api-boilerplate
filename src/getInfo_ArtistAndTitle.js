function DEBUG_getAlbumInfo() {
  let artist = 'Feder';
  let title = 'Goodbye Lyse';

  let res = GetAlbumInfo(artist,title);
  console.log(res)
  if (!res.success) {
    console.error(res)
  }
  return res;
}


/**
 * Fetches info for a given artist and track title using the discogs API.
 * @param {String} artistStr The artist to be queried
 * @param {String} titleStr The track title to be searched for
 * @returns The results object {success:true||false, rateLimitOk:true||false, errors:errors[][], data:info{}, dataraw:data{}}
 */
function GetAlbumInfo(artistStr,titleStr) {
  let data; // will hold the data parsed from the api response
  let info; // final object collecting all information on this item
  let errors = [];
  let rateLimitOk = 'unknown';
  let quotaRemain;

  /**
   * Pre-condition user input strings
   *  - Replace whitespaces with '+'
   *  - encodeURIComponent
   */
  if (!artistStr || !titleStr) {
    return {success:false, rateLimitOk:rateLimitOk, errors:[['missingInfo','Input parameter artist or title missing',artistStr,titleStr]]};
  }

  let artist = encodeURIComponent(artistStr.replace(' ','+'));
  let title = encodeURIComponent(titleStr.replace(' ','+'));

  /**
   * Create the discogs endpoint url
   */
  let url = baseUrl+
  'search?type=master'+
  '&artist='+ artist +
  '&q='+ title +
  //'&token='+ token; // only when using token instead of key & secret
  '&key='+ key +
  '&secret='+ secret;
  //console.log(url);
  

  /**
   * Define the UrlFetchApp Options including a user agent name as per the requirement of discogs
   */
  let options = {
    'method': 'get',
    'headers': {
      'User-Agent':'pawaDiscogsAPItest/0.1'
    },
    'muteHttpExceptions': true,
  }

  /**
   * Query the Discogs API
   */
  let response = UrlFetchApp.fetch(url,options)

  // Return early if the request was not successful
  let status = response.getResponseCode(); //console.log('status: ',status)
  if (status != 200) {
    return {
      success:false, 
      rateLimitOk:rateLimitOk, 
      errors:[['fetchError','Get Request was not successful!\nStatus: '+status, 
      response.getHeaders(),response.getContentText()]], 
      url:url, 
      response:response};
  }

  // Get Remaining Rate Limit Quota from the headers
  let headers = response.getHeaders();
  quotaRemain = headers['x-discogs-ratelimit-remaining'];
  rateLimitOk = (quotaRemain > MIN_QUOTA);

  if (rateLimitOk) {
    //console.log('Response Status:\t%s\nQuota remaining:\t%s\n→ Status:\t\t%s',status,quotaRemain,'OK ✔️')
    //console.log('Remaining quota: ',quotaRemain)
  } else {
    console.warn('⚠️ Quota depleted!: ',quotaRemain)
    //console.warn('Response Status:\t%s\nQuota remaining:\t%s\n→ Status:\t\t%s',status,quotaRemain,'QUOTA DEPLETED! ⚠️')
  }

  /**
   * Process the successful response
   */
  let text = response.getAs('application/json').getDataAsString();
  try {
    // Parse the response data
    data = JSON.parse(text);

    if (data.results) {
      if (data.results.length > 0) {
        // Results are returned. Process them...

        /**
         * Process the first result returned
         */
        let d = data.results[0];
        let aa = artistAndAlbumFromTitle_(d.title); // separate artist and album name from discogs title

        info = {
          country:  d.country,
          year:     d.year,
          genre:    d.genre[0],
          genres:   d.genre.join(' | '),
          style:    d.style[0],
          styles:   d.style.join(' | '),
          title:    d.title,
          artist:   aa.artist,
          album:    aa.album,
          cover_image: d.cover_image,
          resource_url: d.resource_url,
        }
        //console.log(info)
        return {success:true, rateLimitOk:rateLimitOk, data:info, dataraw:data};
      }
      return {success:false, rateLimitOk:rateLimitOk, data:info, dataraw:data};
    }
    return {success:false, rateLimitOk:rateLimitOk, data:info, dataraw:data};

  } catch(e) {
    console.error('ERROR parsing response!\n',e.message,e.stack)
    errors.push([url,options,e.message,e.stack])
    return {success:false, rateLimitOk:rateLimitOk, errors:errors, data:info, dataraw:data};
  } 
}




/**
 * Split the Artist from the Album name
 * @param {String} title The Discogs album title in the form %artist% - %album%
 * @returns {Object} The result object {success:true||false, artist:artist, album:album}
 */
function artistAndAlbumFromTitle_(title) {
  /**
   * Separate artist from album name
   * Expected Input: Elsiane - Hybrid - blabla-adafd
   * Output: 
   *  - artist: Elsiane
   *  - album:  Hybrid - blabla-adafd
   */
  let regex = /(.+?) - (.+)/; 
  let artist = '';
  let album = '';
  if (regex.test(title)) {
    artist = title.match(regex)[1];
    album = title.match(regex)[2];
  }
  let out = {artist:artist, album:album, success:true};
  if(!!artist || !!album) {
    out.success = false;
  }
  return out;
}