const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // App URL configuration
  setAppUrl: (url) => ipcRenderer.invoke('set-app-url', url),
  getAppUrl: () => ipcRenderer.invoke('get-app-url'),
  
  // Updates
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  },
  
  // Printing
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: (printerName, data) => ipcRenderer.invoke('print-receipt', { printerName, data }),
  
  // Settings
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', () => callback());
  },
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

// Log that preload script has loaded
console.log('Electron preload script loaded');
