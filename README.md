# FRED-GoogleSheets (synch-time-fredApi)
- Google Apps Script to FRED API for Federal Reserve Economic Data (FRED) series joined by date
- Michael Ash, University of Massachusetts Amherst
- Comments to [mash@econs.umass.edu](mailto:mash@econs.umass.edu)
- Initial script: Tim Hulley
- Major rewrite and contributions: Vincent Chen
- Original non-Apps Script version of [FRED-API-in-Googlesheets](https://docs.google.com/spreadsheets/d/1dkYQM8ChFcUjU0VWYTXDUBIJlD4uzWciAsKR_uHcLF8/view) as linked by [FRED API Toolkits](https://fred.stlouisfed.org/docs/api/fred/)
- A [more sophisticated version with Categories and Indicators](https://docs.google.com/spreadsheets/d/1FjNBopYxSlXCkngZQCobq9jFTr2AODlIPFHSqPNbE5Y/view) is available from [Vincent Chen]

## This script pulls data series from FRED using the FRED API and joins the series by date in a Google Sheet
- Reads list of desired FRED series and parameters (start, end, frequency, aggregation method, order, etc.) from spreadsheet
- Joins series by date
- The test Google Sheet provided also 
    - Retrieves series metadata
    - Searches for FRED series by keyword

## Use notes
- You need:
    1. A free FRED API key available from [https://research.stlouisfed.org/docs/api/api_key.html](https://research.stlouisfed.org/docs/api/api_key.html)
    2. A Google Sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
        - Here is a  [test Google Sheet with examples, search utility, and metadata retrieval](https://docs.google.com/spreadsheets/d/174yCW6e3L0gZqp9MA_cHA9HBac1EeJomJHR8zagoIHs/view#gid=0)
        - Copy the sheet and the accompanying Apps Script to your Google Drive
- One-time set-up on the Google Sheet: on the Notes/Technical sheet, update the FRED API key with your FRED API key
- Regular use:
    - Enter desired FRED series id's in column A of the sheet Series and set parameters or accept defaults in columns F through K
    - Run the script with new menu item FRED -> "Get FRED Data"
    - (On the first run, there may be a one-time authorization to permit the script to run. Follow the prompts in the dialog boxes to allow the script to run.)


## Editing notes
- Use Tools -> Script Editor to open the Google Apps Script associated with the Google Sheet
- Use [clasp](https://developers.google.com/apps-script/guides/clasp) to edit and manage the script locally. This facilitates going back and forth between the git [repository](https://github.com/michaelaoash/synch-time-fredApi) and your Google Apps Script via a local version.

To update or modify a working version
1. Using git: create/update your fork with the latest version from the main [repository](https://github.com/michaelaoash/synch-time-fredApi) and pull from your fork to your local version.
2. Locally: Modify the program as needed.
3. Using clasp: login to your Apps Script and push your local version to your Apps Script. Test on Apps Script.
4. Using clasp to pull and push, modify on either Apps Script or locally and test on Apps Script.

When done:

5. Using clasp: final pull/push with Apps Script so that the working Apps Script matches your local version
6. Using git: push to your fork and submit a pull request to the main repository
