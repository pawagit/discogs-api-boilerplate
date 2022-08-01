/**
 * Batch Process all rows in the spreadsheet
 * Gracefully terminate if the execution exceeds the runtime limit.
 * @returns data[][] The updated dataset
 */
function RESUME_PROCESS_ALL() {
  const start = new Date();
  /**
   * Retrieve the Resume Settings from the Script Properties
   */
  const P = PropertiesService.getScriptProperties();
  const p = P.getProperties();
  const resumerow = parseInt(p.resumerow,10);

  const startrow = resumerow || 2; // start from resume row if to be resumed
  console.log('Starting from row %s...',startrow)

  /**
   * Fetch the relevant data from the spreadsheet
   */
  const ss = SpreadsheetApp.openById(SSID);
  const s = ss.getSheetByName(SHEET_NAME_AUDIO);

  const maxrow = s.getLastRow();        // row number of last row with data
  const nrows = maxrow - startrow + 1;  // number of rows to be fetched starting from the startrow
  // fetch the data
  const data = s.getRange(startrow,1,nrows,ncols_in).getValues();

  /**
   * As long as there is enough time and rows to be processed, 
   * process each row.
   * Once the time is up, leave the loop
   */
  let timeLeft = true;
  let i=0;
  let out = [];
  while (i < data.length && timeLeft) {
    
    /**
     * Process the item i on row = i+startrow
     */
    let row = data[i];
    let artist = row[artistIdx];
    let title = row[titleIdx];
    let res = GetAlbumInfo(artist, title);
    //if (!res.success) { console.error(res) }

    // Push the results to the output array
    out.push(discogsInfoToRow_(res));

    if (!res.rateLimitOk) {
      console.warn('Rate limit not ok ❌! \nSleeping for '+SLEEP/1000+' secs...')
      Utilities.sleep(SLEEP)
    }

    // Update iterator and timeLeft
    i++;
    timeLeft = ((new Date() - start) < MAX_TIME);

    if (i % 20 == 0) {
      console.log('next row: %s...',i+startrow)
    }
  }

  /**
   * Flush the output data to the spreadsheet
   */
  s.getRange(startrow,insertcol,out.length,out[0].length).setValues(out);
  SpreadsheetApp.flush();
    
  /**
   * Check if Resume is required and Update Script Properties
   */
  const resume = (i < data.length - 1) ? i + startrow : null;
  if (resume) {
    console.warn('Resume required from row %s after %s secs running time! ⚠️',resume, parseInt((new Date()-start)/1000,10) )
    P.setProperty('resumerow',resume)
  } else {
    P.deleteProperty('resumerow')
    console.log('All complete!  after %s secs running time! ✔️', parseInt((new Date()-start)/1000,10), P.getProperties())
  }
  
  return out; 
}



/**
 * Create a row[] for the given discogs response data to be passed to the spreadsheet.
 * @param {Object} res The discogs GetInfo response object
 * @returns {Array} The row[] array to be pushed to the spreadsheet
 */
function discogsInfoToRow_(res) {
  let row;
  if (res.success) {
    let d = res.data;
    row = [
      new Date(),
      d.resource_url,
      d.cover_image,
      d.artist,
      d.title,
      d.album,
      d.year,
      d.genre,
      d.genres,
      d.style,
      d.styles,
      d.country,
    ]
  } else {
    row = [
      new Date(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
  }
  return row;
}