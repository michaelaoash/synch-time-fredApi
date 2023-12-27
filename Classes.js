/********************************
BSD License
Copyright 2020 Michael Ash & Tim Hulley & Vincent Chen
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
********************************/

// SeriesSpec holds the specifications for a data series to retrieve from
// data APIs like FRED.
//
// series: unique code that identifies a series
// title: friendly title for the series
// observation_start: starting date, yyyy-mm-dd
// observation_end: ending date, yyyy-mm-dd
// sort_order_text: the "pretty" value for sort order
// units_text: the "pretty" value for units
// frequency_text: the "pretty" value for frequency
// aggregation_method_text: the "pretty" value for frequency-aggregation method
// description: more detailed description for the series
class SeriesSpec {
  constructor (
    series, title, observation_start, observation_end, sort_order_text,
    units_text, frequency_text, aggregation_method_text,
    description='') {
      this.series = series;
      this.title = title;
      this.observation_start = observation_start;
      this.observation_end = observation_end;
      this.sort_order_text = sort_order_text;
      this.units_text = units_text;
      this.frequency_text = frequency_text;
      this.aggregation_method_text = aggregation_method_text;
      this.description = description;
  }
  toString() {
    return `${this.series}: ${this.title} / ${this.units_text} /` +
        ` ${this.frequency_text} / ${this.aggregation_method_text}`;
  }
}

// Holds both the specification (spec) used to load the data and the
// loaded data.
// Fields:
//   series: The series code
//   title: The friendly title for the series
//   etc: The units string that includes seasonal adjustments (need better name)
//   is_descending: true or false
//   data: Associative array mapping date to value
class SeriesData {
  // spec is an instance of FREDSeriesSpec.
  // etc is the string to display for units, including seasonal adjustments
  // data is the loaded data, mapping date to value
  constructor(spec, etc, data) {
    this.series = spec.series;
    this.title = spec.title;
    this.is_descending = (spec.sort_order_text == 'Descending');
    this.etc = etc;    // Combines units and seasonal adjusments
    this.data = data;  // map of date to value
  }
}

// SeriesSpecLoad is an abstract base class for a SeriesSpec loader
// Derived classes need to provide implementations for:
//
// GetSpecRows: that returns rows of values from a sheet that represents the specs
// DecodeRow: that convers a row of values (array) to FREDSeriesSpec.
//
// The LoadAll method loads the specs from a specified spreadsheet object
// and returns an array of FREDSeriesSpec objects.
class SeriesSpecLoader {
  constructor (sheetname) {
    this._sheetname = sheetname;
  }

  GetSpecRows(seriesSheet) {}
  DecodeRow(row) {}

  // Loads the specifications for the series we want to load.
  // Returns an array of specifications, each is an object of the form:
  LoadAll(spreadsheet) {
    if (spreadsheet === undefined) {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    var specRows = this.GetSpecRows(spreadsheet.getSheetByName(this._sheetname));
    //Logger.log(specRows)
    Logger.log(specRows.length)

    var allSpecs = [];
    for(const row of specRows) {
      allSpecs.push(this.DecodeRow(row));
    }
    return allSpecs;
  }
}

// A loader for specifications in the original Series spreadsheet.
class SimpleSeriesSpecLoader extends SeriesSpecLoader {

  get ColIdx() {
    const colIdx = {
      'Code': 0,
      'Title': 1,
      'BaseUnits': 2,
      'Availability': 3,
      'Notes': 4,
      'StartDate': 5,
      'EndDate': 6,
      'Sort': 7,
      'Units': 8,
      'Frequency': 9,
      'Aggregation': 10
    };
    return colIdx;
  }

  GetSpecRows(seriesSheet) {
    // Get the series and parameters from the spreadsheet.
    var seriesList = seriesSheet.getRange("A2:A").getValues();
    var numberOfSeries = seriesList.filter(String).length;    

    Logger.log(numberOfSeries);

    var range = seriesSheet.getRange(2, 1, numberOfSeries, Object.values(this.ColIdx).length);
    return range.getValues();
  }

  DecodeRow(row) {
    var idx = this.ColIdx;
    return new SeriesSpec(
        row[idx.Code],
        row[idx.Title],
        (row[idx.StartDate] == '' ? ''
            : Utilities.formatDate(row[idx.StartDate], 'GMT', 'yyyy-MM-dd')),
        (row[idx.EndDate] == '' ? ''
            : Utilities.formatDate(row[idx.EndDate], 'GMT', 'yyyy-MM-dd')),
        row[idx.Sort],
        row[idx.Units],
        row[idx.Frequency],
        row[idx.Aggregation]
    );
  }
}


