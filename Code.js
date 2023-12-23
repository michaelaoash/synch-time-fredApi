/********************************
BSD License
Copyright 2020 Michael Ash & Tim Hulley & Vincent Chen
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
********************************/

/********************************
This script pulls data from the FRED API and series by date 

Retrieves series metadata
Reads list of desired series and parameters (start, end, order, etc.) from spreadsheet
Joins series by date

To use it, you'll need:

1. A free FRED API key available from https://research.stlouisfed.org/docs/api/api_key.html
2. A google sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
3. Test sheet with examples: https://docs.google.com/spreadsheets/d/1f4Y-MgRf5d6qNOaOPmtz8HsEa3sW5E1hPP1kzpDfNMo/edit#gid=0 
   You need to put your API key in the first cell on the first sheet.
   (This cell has a named range called "APIKey", which is shown to the left of the Formula bar.)
4. Run the script with menu FRED -> "Get FRED Data"


********************************/

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Get FRED Data', functionName: 'GetFredData'}
  ];
  spreadsheet.addMenu('FRED', menuItems);
}

// getApiKey returns the value in the cell with named range, 'APIKey'.
function getApiKey() {
  var apiKeyCell = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('APIKey');
  if (apiKeyCell === null) {
    throw "Error: Please set APIKey on the first sheet";
  }
  return apiKeyCell.getValue();
}

// GetFredData() is the main function. It loads specs from the "Series" sheet, then loads
// the specified data to output to a sheet.
function GetFredData() {
  var apiKey = getApiKey();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var loader = new SimpleSeriesSpecLoader('Series');
  var allSpecs = loader.LoadAll(ss);
  
  loadSeriesToSheet(apiKey, ss, 'Output', allSpecs);
}

// loadSeriesToSheet is the main work routine that fetches data from FRED, based
// on 'specs' (array of FREDSeriesSpec) and writes the data to the sheet named sheetname.
// The sheet is created if it doesn't exist.
function loadSeriesToSheet(apiKey, ss, sheetname, specs) {
  var allDates = {};
  var allSeriesData = []
  
  // If any series is marked Descending then the full output will be descending, last to first.
  var descending_flag = 0 ;

  // Cycle through the specs to retrieve indicates series data 
  for (series of specs) {
    // Loads metadata and data as an Object for the series.
    seriesData = loadOneSeries(apiKey, series);
    if (seriesData.is_descending) {
      descending_flag = 1;
    }
    // Gets array of dates from keys of date-value map, then iterate using for...of syntax.
    for(const d of Object.keys(seriesData.data)) {
      // Adding date to associative array automatically makes it unique
      allDates[d] = 1;
    }
    allSeriesData.push(seriesData);
  }
  // Get sorted dates
  theDates = Object.keys(allDates).sort();
  if (descending_flag == 1) {
    theDates.reverse()
  }
  // Arrange into 2-d array of arrays that can be inserted into sheet.
  var array = arrangeSeriesData(allSeriesData, theDates);

  // write array to sheet
  var newSheet = ss.getSheetByName(sheetname);
  if (newSheet != null) {
    newSheet.getDataRange().clear();
  } else {
    newSheet = ss.insertSheet();
    newSheet.setName(sheetname);
  }
  var r = newSheet.getRange(1, 1, array.length, specs.length+1);
  r.setValues(array);
  formatTable(r, 3);
}

// loadSeries loads the series metadata and data, based on spec, and returns an
// object. The spec is an instance FREDSeriesSpec. Returns an instance of
// FREDSeriesData.
function loadOneSeries(apiKey, spec) {
  if (spec.series =='') {
    return new FREDSeriesData(spec, spec.units_text, {});
  }
  // Query FRED for data and metadata for the series.   
  var data = fredQueryData(apiKey, spec);
  var meta = fredQueryMeta(apiKey, spec.series) ;

  // Return loaded data as an Object that contains metadata and the data
  return new FREDSeriesData(
    spec,
    [spec.units_text, meta.seriess[0]["units"], meta.seriess[0]["seasonal_adjustment_short"]].join(' '),
    arrayToDateValueMap(data)  // map of date to value
  );
}

// formatData formats loaded data as array of arrays that can be inserted
// directly into a sheet. allSeriesData is an array of FREDSeriesData.
function arrangeSeriesData(allSeriesData, dates) {
  // write three header rows with metadata
  var array = [] 
  array[0] = (['Series'].concat(getAllSeriesInfo(allSeriesData, 'series'))) ;
  array[1] = (['Units/Seasonality'].concat(getAllSeriesInfo(allSeriesData, 'etc'))) ; 
  array[2] = (['Date'].concat(getAllSeriesInfo(allSeriesData, 'title'))) ;

  // Creates row array entries of data series from the associative array
  // Use for...of syntax, instead of for...in, to get values directly
  for (const d of dates) {
    // append each date's data to the array without having to main 'i' index.
    array.push(
      // Each row is a date, followed by values.
       [d].concat(getAllSeriesData(allSeriesData, d))
    );
  };
  return array;
}

// formatTable formats the heading rows and adjusts column width.
function formatTable(datarange, numHeaderRows) {
  var h = datarange.offset(0, 0, numHeaderRows, datarange.getNumColumns());
  h.setBackground('lightgrey');
  h.setFontWeight('bold');
  h.setWrap(true);
  var sheet = datarange.getSheet();
  sheet.setFrozenRows(numHeaderRows);
  sheet.setColumnWidths(2, datarange.getNumColumns()-1, 150);
}

// Returns array of metadata for the specified spec field, where allSeriesData
// is an array of FREDSeriesData that contains the spec of the series.
function getAllSeriesInfo(allSeriesData, field) {
  meta = [];
  for (d of allSeriesData) {
    meta.push(d[field]);  // appends "field" value to meta array.
  }
  return meta;
}

// Returns array of data values for the specified date, dt, where allSeriesData
// is an array of FREDSeriesData that contains the data, which is
// an associate array: {date: value}
function getAllSeriesData(allSeriesData, dt) {
  // ASSUMPTION: dataMap maintains insertion order.
  values = [];
  for (d of allSeriesData) {
    values.push(d.data[dt]);  // appends data value to values array.
  }
  return values;
}

// Use associative arrays to map pretty strings to codes.
// Just lookup instead of using "switch" statements.

const SortOrderCode = {
  'Descending': 'desc',
  'Ascending': 'asc'
}

const UnitsCode = {
  'Default Units': 'lin',
  'Change from Previous Period': 'chg',
  'Change from Year Ago': 'ch1',
  'Percent Change from Previous Period': 'pch',
  'Percent Change from Year Ago': 'pc1',
  'Compounded Annual Rate of Change': 'pca',
  'Continuously Compounded Rate of Change': 'cch',
  'Compounded': 'cca',
  'Log': 'log'
}

const FrequencyCode = {
  'Daily': 'd',
  'Weekly': 'w',
  'Bi-weekly': 'bw',
  'Monthly': 'm',
  'Quarterly': 'q',
  'Seminannual': 'sa',
  'Annual': 'a',
  'Weekly, Ending Friday': 'wef',
  'Weekly, Ending Thursday': 'weth',
  'Weekly, Ending Wednesday': 'wew',
  'Weekly, Ending Tuesday': 'wetu',
  'Weekly, Ending Monday': 'wem',
  'Weekly, Ending Sunday': 'wesu',
  'Weekly, Ending Saturday': 'wesa',
  'Biweekly, Ending Wednesday': 'bwew',
  'Biweekly, Ending Monday': 'bwem'
}

const AggregationCode = {
  'End of Period': 'eop',
  'Sum': 'sum',
  'Average': 'avg'
}


// Read the current data series into an associative array indexed by the date
// About associative arrays
// https://en.it1352.com/article/0b48e00aa8834562bcb01c531ac75f03.html
// http://www.mojavelinux.com/articles/javascript_hashes.html
function arrayToDateValueMap(data) {
  var map = {}
  // Use for...of to iterate through values, no need to use [i] lookup.
  for (const observation of data.observations) {
    map[observation['date']] = observation['value'];
  }
  return map ;
}

// buildUrl builds URL from an HTTP address and queryParams as an associative array.
//
// Assuming queryParams is an associative array of form:
// {
//    key1: val1,
//    key2: val2
// }
// This returns a string like: "url?key1=val2&key2=val2"
//
function buildUrl(baseUrl, queryParams) {
  // Object.entries returns an Array of queryParams as (key, value) pairs.
  // The map() method runs a function for each pair to convert into "key=value" string, resulting
  // in an Array of "key=value" entries (replacing null values with empty string).
  // Finally, the join() method concatenates all the strings using "&" as separator.
  var q = Object.entries(queryParams).map(
    ([k, v]) => `${k}=${encodeURIComponent(v == null ? '' : v)}`).join("&");
  return [baseUrl, '?', q].join('');
}

function loadJsonFromUrl(baseUrl, params) {
  var url = buildUrl(baseUrl, params);

  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var json = response.getContentText();
  return {'url': url, 'data': JSON.parse(json)};
}

// Construct, send query to FRED API for metadata on series
function fredQueryMeta(apiKey, FREDcode)  {
  var params = {
    'series_id': FREDcode,
    'api_key': apiKey,
    'file_type': 'json'
  }
  var response = loadJsonFromUrl('https://api.stlouisfed.org/fred/series', params);
  Logger.log(FREDcode + ' ' + response.url + " metadata fetched " + response.data);  
  return response.data ;  
}

// Construct, send query to FRED API for a data series, where spec
// is instance of FREDSeriesSpec.
function fredQueryData(apiKey, spec) {
  var params = {
    'series_id': spec.series,
    'observation_start': spec.observation_start,
    'observation_end': spec.observation_end,
    'sort_order': SortOrderCode[spec.sort_order_text],
    'units': UnitsCode[spec.units_text],
    'frequency': FrequencyCode[spec.frequency_text],
    'aggregation_method': AggregationCode[spec.aggregation_method_text],
    'api_key': apiKey,
    'file_type': 'json'
  };
  var response = loadJsonFromUrl('https://api.stlouisfed.org/fred/series/observations', params);
  Logger.log(spec.series + ' ' + response.url + " data fetched");  
  return response.data;  
}

// Construct, send query to FRED API to search for data series.
// Returns array of XX
function fredSearchSeries(apiKey, text, limit) {
  var params = {
    'search_text': text,
    'limit': limit,
    'api_key': apiKey,
    'file_type': 'json'
  };
  var response = loadJsonFromUrl("https://api.stlouisfed.org/fred/series/search", params);
  Logger.log(text + ' ' + response.url + " data fetched");  
  return response.data;
}

// =====================================

// Show the search sidebar
function showSearchSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Search')
      .setTitle('Search Criteria');
  SpreadsheetApp.getUi().showSidebar(html);
}

// Called by the sidebar to perform the search.
function SearchFredSeries(search_text, limit) {
  const sheetname = 'Search';
  var apiKey = getApiKey();
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetname);
  if (sheet == null) {
    throw "Error: Please add a sheet named 'Search'";
  }
  sheet.activate();
  var results = fredSearchSeries(apiKey, search_text, limit);
  var array = arrangeSearchResults(results);
  if (array.length == 0) {
    throw `Error: No data found for search text "${search_text}"`;
  }

  const headerRows = 4;
  var range = sheet.getDataRange();
  var r = sheet.getRange(headerRows+1, 1, 1);
  if (range.getNumRows() > headerRows) {
    r = range.offset(headerRows, 0, range.getNumRows()-headerRows, range.getNumColumns());
    r.clear();
  } 
  r = r.offset(0, 0, array.length, array[0].length);
  r.setValues(array);
  r.setWrap(true);
}

function arrangeSearchResults(results) {
  var all = []
  // extract needed fields from all series in result.
  for (r of results['seriess']) {
    var series = [
      r['id'],
      r['title'],
      r['units'],
      r['frequency'],
      r['observation_start'],
      r['observation_end'],
      r['seasonal_adjustment'],
      r['notes']
    ]
    all.push(series);
  }
  return all;
}

// ==========================================================================

// Writes the mapping of pretty names-to-codes into the "Constants" sheet.
// This makes sure that the drop-down selections will actually match
// the strings used for matching.
function createDropdownConstants() {
  const sheetName = 'Constants';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (sheet != null) {
    sheet.getDataRange().clear();
  } else {
    sheet = ss.insertSheet();
    sheet.setName(sheetName);  
  }
 
  r = 1;
  r += insertConstants(ss, sheet, r, 'Order', SortOrderCode) + 1;
  r += insertConstants(ss, sheet, r, 'Units', UnitsCode) + 1;
  r += insertConstants(ss, sheet, r, 'Frequency', FrequencyCode) + 1;
  r += insertConstants(ss, sheet, r, 'FrequencyAggregation', AggregationCode) + 1;
}

// Inserts a header and the key/values into the sheet at the specified row.
// 'codes' is a map of pretty names to codes and 'name' is a name to
// use for the column headings and the named ranges.
//
// - The first column has the named-range name of name + 'Pretty'
// - The second column has the name-range name of just name
//
// Returns the number of rows inserted.
function insertConstants(ss, sheet, row, name, codes) {
  // Form 2-d array of heading and values for the specified codes
  var array = [[name, 'Code']].concat(Object.entries(codes));
  var r = sheet.getRange(row, 1, array.length, 2);
  r.setValues(array);
  r = r.offset(1, 0, array.length - 1, 1);
  ss.setNamedRange(name + 'Pretty', r);
  ss.setNamedRange(name, r.offset(0, 1));

  // Format header row
  r = sheet.getRange(row, 1, 1, 2);
  r.setFontWeight('bold');
  r.setBackground('lightgrey');
  return array.length;
}
