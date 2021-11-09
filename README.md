# synch-time-fredApi
- Google Apps Script to FRED API for Federal Reserve Economic Data (FRED) series joined by date
- Michael Ash, University of Massachusetts Amherst
- Comments to [mash@econs.umass.edu](mailto:mash@econs.umass.edu)

## This script pulls data series from FRED using the FRED API and joins the series by date in a Google Sheet
- Reads list of desired series and parameters (start, end, order, etc.) from spreadsheet
- Joins series by date
- The test Google Sheet provided also 
    - Retrieves series metadata
    - Searches for FRED series by keyword

## Use notes
- You need:
    1. A free FRED API key available from [https://research.stlouisfed.org/docs/api/api_key.html](https://research.stlouisfed.org/docs/api/api_key.html)
    2. A Google Sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
        - Here is a  [test Google Sheet with examples, search utility, and metadata retrieval](https://docs.google.com/spreadsheets/d/1f4Y-MgRf5d6qNOaOPmtz8HsEa3sW5E1hPP1kzpDfNMo/edit#gid=0) 
        - Copy this sheet to your Google Drive
- One-time set-up:
    1. On the Google Sheet,
        - On the Notes/Technical sheet, update the FRED API key with your FRED API key 
        - Use Tools -> Script Editor to open a Google Apps Script associated with the Google Sheet
    2. Paste the code.gs text of the synch-time-fredApi script into the script editor window
    3. In the code.gs script, update the FRED API key with your FRED API key
    4. There may be a one-time authorization to permit the script to run
- To use:
    - Enter desired FRED series id's in column A of the sheet Series
    - Run the script with new menu item FRED -> "Get FRED Data"
