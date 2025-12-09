const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
const registerForm = document.getElementById('register-form') as HTMLFormElement | null;
const authError = document.getElementById('auth-error');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const showReset = document.getElementById('show-reset');
const registerLinks = document.getElementById('register-links');
const authLinks = document.querySelector('.auth-links:not(#register-links)');

let isLoading = false;

function showError(message: string): void {
  if (authError) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }
}

function hideError(): void {
  authError?.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  isLoading = loading;
  const buttons = document.querySelectorAll('.auth-form button');
  buttons.forEach((btn) => {
    (btn as HTMLButtonElement).disabled = loading;
  });
}

function showAppView(): void {
  authView?.classList.add('hidden');
  appView?.classList.remove('hidden');
  void loadLicenseInfo();
}

function showAuthView(): void {
  appView?.classList.add('hidden');
  authView?.classList.remove('hidden');
}

async function loadLicenseInfo(): Promise<void> {
  const licenseInfo = document.getElementById('license-info');
  if (!licenseInfo) return;

  try {
    const status = await window.electronAPI.getLicenseStatus();
    if (status) {
      const s = status as {
        email: string;
        tier: string;
        isLifetime: boolean;
        daysRemaining: number | null;
      };
      licenseInfo.innerHTML = `
        <p><strong>Email:</strong> ${s.email}</p>
        <p><strong>Tier:</strong> ${s.tier}</p>
        <p><strong>Status:</strong> ${
          s.isLifetime ? 'Lifetime' : `${s.daysRemaining ?? 0} days remaining`
        }</p>
      `;
    } else {
      licenseInfo.innerHTML = '<p class="text-secondary">No license info available</p>';
    }
  } catch {
    licenseInfo.innerHTML = '<p class="text-secondary">Failed to load license info</p>';
  }
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  hideError();
  setLoading(true);

  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const password = (document.getElementById('login-password') as HTMLInputElement).value;

  try {
    await window.electronAPI.login(email, password);
    showAppView();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Login failed');
  } finally {
    setLoading(false);
  }
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  hideError();
  setLoading(true);

  const email = (document.getElementById('register-email') as HTMLInputElement).value;
  const password = (document.getElementById('register-password') as HTMLInputElement).value;
  const licenseKey = (document.getElementById('register-license') as HTMLInputElement).value;

  try {
    await window.electronAPI.register(email, password, licenseKey);
    showAppView();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Registration failed');
  } finally {
    setLoading(false);
  }
});

showRegister?.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm?.classList.add('hidden');
  registerForm?.classList.remove('hidden');
  authLinks?.classList.add('hidden');
  registerLinks?.classList.remove('hidden');
  hideError();
});

showLogin?.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm?.classList.add('hidden');
  loginForm?.classList.remove('hidden');
  registerLinks?.classList.add('hidden');
  authLinks?.classList.remove('hidden');
  hideError();
});

showReset?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = window.prompt('Enter your email address:');
  if (email) {
    try {
      await window.electronAPI.resetPassword(email);
      window.alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to send reset email');
    }
  }
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await window.electronAPI.logout();
  showAuthView();
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await window.electronAPI.validateLicense();
    const r = result as { valid: boolean };
    if (r.valid) {
      showAppView();
    }
  } catch {
    // stay on auth view
  }
});

