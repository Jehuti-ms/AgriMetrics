// modules/auth.js
console.log('🔄 Initializing Auth Module...');

class AuthModule {
  constructor() {
    this.init();
  }

  init() {
    // Inject social buttons into the existing social-login-container
    const socialContainer = document.getElementById('social-login-container');
    if (socialContainer) {
      socialContainer.innerHTML = authManager.renderAuthButtons();
      console.log('✅ Social buttons injected into existing container');
    }

    // Attach listeners to existing forms
    const signinForm = document.getElementById('signin-form-element');
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        authManager.signIn(email, password);
      });
    }

    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const farmName = document.getElementById('farm-name').value;

        authManager.signUp(email, password, { name, farmName });
      });
    }

    const forgotForm = document.getElementById('forgot-password-form-element');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        authManager.resetPassword(email);
      });
    }
  }
}

window.authModule = new AuthModule();
