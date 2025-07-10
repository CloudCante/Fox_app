window.electronAPI.sendMessage('hello from renderer');

window.electronAPI.onMessage((msg) => {
  console.log('Received from main:', msg);
});

console.log('Running in:', window.electronAPI.platform);
