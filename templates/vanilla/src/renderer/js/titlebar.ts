document.addEventListener('DOMContentLoaded', () => {
  const btnMinimize = document.getElementById('btn-minimize');
  const btnMaximize = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');

  btnMinimize?.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  btnMaximize?.addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
  });

  btnClose?.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });
});

