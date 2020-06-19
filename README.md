# synch-time-fredApi
- Google Apps Script to FRED API for Federal Reserve Economic Data (FRED) series joined by date
- Michael Ash, University of Massachusetts Amherst
- Comments to [mash@econs.umass.edu](mailto:mash@econs.umass.edu)

This script pulls data series from the FRED API and joins the series by date 
Retrieves series metadata
Reads list of desired series and parameters (start, end, order, etc.) from spreadsheet
Joins series by date
- You need:
    1. A free FRED API key available from [https://research.stlouisfed.org/docs/api/api_key.html](https://research.stlouisfed.org/docs/api/api_key.html)
    2. A Google Sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
        - Here is a  [test sheet with examples](https://docs.google.com/spreadsheets/d/1f4Y-MgRf5d6qNOaOPmtz8HsEa3sW5E1hPP1kzpDfNMo/edit#gid=0)
- One-time set-up.
    1. On the Google Sheet,
        - On the Notes/Technical sheet, update the FRED API key with your FRED API key 
        - Use Data -> Script Editor to open a Google Apps Script associated with the Google Sheet
    2. Paste the code.gs text of the synch-time-fredApi script into the script editor window
    3. In the code.gs script, update the FRED API key with your FRED API key 
- To use:
    - Enter desired FRED series id's in column A of the sheet Series
    - Run the script with menu FRED -> "Get FRED Data"
