# synch-time-fredApi
Google Apps Script to FRED API for FRED series joined by date


This script pulls data series from the FRED API and joins the series by date 
Retrieves series metadata
Reads list of desired series and parameters (start, end, order, etc.) from spreadsheet
Joins series by date
To use it, you'll need:
1. A free FRED API key available from [https://research.stlouisfed.org/docs/api/api_key.html](https://research.stlouisfed.org/docs/api/api_key.html)
2. A google sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
3. Here is  [test sheet with examples](https://docs.google.com/spreadsheets/d/1f4Y-MgRf5d6qNOaOPmtz8HsEa3sW5E1hPP1kzpDfNMo/edit#gid=0)
4. Use Data -> Script Editor to open a Google Apps Script associated with the spreadsheet and paste this script into the script editor window, updating the FRED API key below with the key you registered in step 1
5. Run the script with menu FRED -> "Get FRED Data"
