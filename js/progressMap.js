const { ipcRenderer } = require('electron');
const settings = require('electron-settings');

const mapzenSearch = require('pelias-batch-search');

// Add a map to the 'map' div
let map = null;
const pulsingIcon = L.icon.pulse({iconSize:[10,10],color: 'red'});
  
document.getElementById('body').onload = () => {
  // Add a Mapzen API key
  L.Mapzen.apiKey = settings.get('apiKey');
  map = L.Mapzen.map('map', {maxZoom: 18, minZoom:2});
  
  // Set the center of the map to be the San Francisco Bay Area at zoom level 12
  map.setView([0, 0], 2);

  var params = {
    inputFile: settings.get('inputDataPath'),
    outputFile: settings.get('outputDataPath') || `${settings.get('inputDataPath')}.output.csv`,
    queryParams: {
      'api_key': settings.get('apiKey')
      // "boundary.rect.min_lat": 39.719799,
      // "boundary.rect.min_lon": -80.519851,
      // "boundary.rect.max_lat": 42.516072,
      // "boundary.rect.max_lon": -74.689502
    }    
  };

  const totalCount = settings.get(`${settings.get('inputDataPath')}.lineCount`) || 0;
  mapzenSearch(
    params,
    function (updateType, data, bbox) {
      switch (updateType) {
        case 'progress':
          updateProgress(data, totalCount, bbox);
          break;
        case 'row':
          addDotToMap(data, bbox);  
          break;
      }  
    },
    function () {
      document.getElementById('btnPause').remove();
      document.getElementById('progress').remove();
      document.getElementById('btnStop').textContent = 'weeee, let\'s do that again!';
      document.getElementById('btnStop').addEventListener('click', _ => {
        ipcRenderer.send('loadPage', 'apiKey');
      });
    }
  );
};

function addDotToMap(data, bbox) {
  const marker = L.marker([data.res_latitude, data.res_longitude], {icon: pulsingIcon}).addTo(map);
  marker.bindPopup(data.res_label);
  
  const bounds = L.latLngBounds(L.latLng(bbox.minLat, bbox.minLon), L.latLng(bbox.maxLat, bbox.maxLon));  
  map.fitBounds(bounds, {padding:[50,50]});
}

function updateProgress(progress, totalCount) {
  let progressText = `Processed ${progress} rows`;
  if (totalCount > 0) {
    progressText += ` of ${totalCount}`;
  }
  document.getElementById('progress').innerHTML = progressText;
}