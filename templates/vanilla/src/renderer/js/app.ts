document.addEventListener('DOMContentLoaded', async () => {
  try {
    const info = await window.electronAPI.getAppInfo();
    const titleEl = document.querySelector('.titlebar-title');
    if (titleEl) {
      titleEl.textContent = info.name;
    }
    document.title = info.name;
  } catch {
    // ignore
  }

  try {
    const version = await window.electronAPI.getVersion();
    if (version.isPackaged) {
      const update = await window.electronAPI.checkForUpdates();
      if (update.updateAvailable) {
        // Placeholder: hook your own UI
        // eslint-disable-next-line no-console
        console.warn(`Update available: ${update.version ?? 'unknown'}`);
      }
    }
  } catch {
    // ignore update check errors
  }
});

window.electronAPI.onUpdateStatus((status) => {
  // eslint-disable-next-line no-console
  console.warn('Update status:', status);
});

