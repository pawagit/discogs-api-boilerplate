/**
 * Discogs API - Info Fetcher
 * 
 *  Fetches Infos from the Discogs API for a given music track and artist.
 *  Is used to enrich telegram audio tracks metadata
 * 
 *  Example endpoint Url to search by artist and track title
 *  →  https://api.discogs.com/database/search?type=master&artist=Elsiane&q=Across+The+Stream&token=MY_DISCOGS_TOKEN
 */


/**
 * Discogs API Parameters
 */
const token =   'MY_DISCOGS_TOKEN';   // Discogs API Token
const key =	    'MY_DISCOGS_KEY';     // or Discogs App Consumer Key & Secret
const secret =  'MY_DISCOGS_SECRET';
const baseUrl = 'https://api.discogs.com/database/';          // API Endpoint Base Url
const MIN_QUOTA = 10;

/**
 * Database Spreadsheet Parameters
 */
const SSID = 'MY_SPREADSHEET_ID';
const SHEET_NAME_AUDIO = 'MY_SHEET';
const firstrow = 2;         // first row with data
const ncols_in = 17;        // number of input data columns

const artistIdx = 13;       // Artist column index (Col A = idx 0)
const titleIdx = 14;        // Title column index (Col A = idx 0)

const insertcol = 18;       // First column where the output data will be added


/**
 * Batch Process - Resume Logic Parameters
 */
const MAX_TIME = 1*60*1000; // Limit overall execution to a safe max execution time [milliseconds]
const SLEEP = 30*1000;  // Sleep for x [milliseconds]
