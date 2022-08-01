# Discogs API - Google Apps Script Boilerplate
## Basic functions to fetch information from the Discogs API for each item in a spradsheet. With resume functionality.

### Keywords 
`discogs-api`  `resume`  `spreadsheet`  `google-sheets`  `google-apps-script`  `trigger`  `batch-process`  `maximum-execution-time`  `bulk-process` 

### Functionality & Features 
- RESUME_PROCESS_ALL(): Processes all rows on a given spreadsheet. 
- GetAlbumInfo(artist,title): Fetch info from the api for a given artist and title.

### Time based trigger 
**Hint**: 
→ Set a recurring trigger for RESUME_PROCESS_ALL() (⚠️ every x minutes, where  x > MAX_TIME!)
