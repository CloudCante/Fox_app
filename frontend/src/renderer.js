import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
const env = window.electronAPI.getEnv();
console.log('Running on platform:', env.platform, '| NODE_ENV:', env.NODE_ENV);
window.electronAPI.sendMessage('hello from renderer');

window.electronAPI.onMessage((msg) => {
  console.log('Received from main:', msg);
});

console.log("Platform:", window.electronAPI.getEnv().platform);
