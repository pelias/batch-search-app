const { ipcRenderer } = require('electron');
const settings = require('electron-settings');

document.getElementById('btnPrev').addEventListener('click', _ => {
  ipcRenderer.send('loadPage', 'apiKey');
});

document.getElementById('btnNext').addEventListener('click', _ => {
  ipcRenderer.send('loadPage', 'selectColumns');
});

document.getElementById('inputDataPathDisplay').addEventListener('click', _ => {
  ipcRenderer.send('openFile');
});

document.getElementById('outputDataPathDisplay').addEventListener('click', _ => {
  ipcRenderer.send('createFile', settings.get('inputDataPath'));
});

ipcRenderer.on('openFileResults', (event, filename) => {
  settings.set('inputDataPath', filename);
  document.getElementById('inputDataPathDisplay').innerText = filename;
});

ipcRenderer.on('createFileResults', (event, filename) => {
  settings.set('outputDataPath', filename);
  document.getElementById('outputDataPathDisplay').innerText = filename;
});

document.getElementById('body').onload = () => {
  if (settings.has('inputDataPath')) {
    document.getElementById('inputDataPathDisplay').innerText = settings.get('inputDataPath');
  }  
};