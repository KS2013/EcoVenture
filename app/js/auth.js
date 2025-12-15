/**
 * EcoQuest Auth Module
 * Authentication UI handlers
 */

const AuthModule = {
  isLoggedIn: false,
  authUser: null,
  userProfile: null,

  // Setup auth listeners
  setupListeners() {
    // Auth button in header
    const authBtn = document.getElementById('authBtn');
    if (authBtn) authBtn.addEventListener('click', () => this.openModal('signin'));

    // Auth banner
    const authBannerBtn = document.getElementById('authBannerBtn');
    if (authBannerBtn) authBannerBtn.addEventListener('click', () => this.openModal('signin'));

    // Profile page buttons
    const showSignUpBtn = document.getElementById('showSignUpBtn');
    const showSignInBtn = document.getElementById('showSignInBtn');
    if (showSignUpBtn) showSignUpBtn.addEventListener('click', () => this.openModal('signup'));
    if (showSignInBtn) showSignInBtn.addEventListener('click', () => this.openModal('signin'));

    // Modal controls
    const authModalClose = document.getElementById('authModalClose');
    const authModal = document.getElementById('authModal');
    if (authModalClose) authModalClose.addEventListener('click', () => this.closeModal());
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) this.closeModal();
      });
    }

    // Form switches
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    const backToSignInBtn = document.getElementById('backToSignInBtn');
    if (switchToSignUp) switchToSignUp.addEventListener('click', () => this.showForm('signup'));
    if (switchToSignIn) switchToSignIn.addEventListener('click', () => this.showForm('signin'));
    if (backToSignInBtn) backToSignInBtn.addEventListener('click', () => this.showForm('signin'));

    // Form submissions
    const signInSubmitBtn = document.getElementById('signInSubmitBtn');
    const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');
    if (signInSubmitBtn) signInSubmitBtn.addEventListener('click', () => this.handleSignIn());
    if (signUpSubmitBtn) signUpSubmitBtn.addEventListener('click', () => this.handleSignUp());

    // Sign out
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) signOutBtn.addEventListener('click', () => this.handleSignOut());

    // Leaderboard sign in buttons
    const leaderboardSignInBtn = document.getElementById('leaderboardSignInBtn');
    const globalSignInBtn = document.getElementById('globalSignInBtn');
    if (leaderboardSignInBtn) leaderboardSignInBtn.addEventListener('click', () => this.openModal('signin'));
    if (globalSignInBtn) globalSignInBtn.addEventListener('click', () => this.openModal('signin'));

    // Initialize Supabase auth listener
    this.initSupabaseListener();
  },

  // Initialize Supabase auth state listener
  async initSupabaseListener() {
    if (!window.EcoQuestAuth || !window.EcoQuestAuth.isConfigured()) return;

    window.EcoQuestAuth.init();

    // Check existing session
    const session = await window.EcoQuestAuth.getSession();
    if (session) {
      this.authUser = session.user;
      this.isLoggedIn = true;

      try {
        this.userProfile = await window.EcoQuestAuth.getUserProfile(session.user.id);
      } catch (e) {
        this.userProfile = this.createDefaultProfile(session.user);
      }

      this.updateUI();
    }

    // Listen for auth changes
    window.EcoQuestAuth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.authUser = session.user;
        this.isLoggedIn = true;
        this.updateUI();
      } else if (event === 'SIGNED_OUT') {
        this.authUser = null;
        this.userProfile = null;
        this.isLoggedIn = false;
        this.updateUI();
      }
    });
  },

  // Create default profile object
  createDefaultProfile(user) {
    return {
      id: user.id,
      username: user.email?.split('@')[0] || 'User',
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      total_points: 0,
      submissions: 0,
      current_streak: 0,
      area: null,
      country: null,
      friend_code: null
    };
  },

  // Open auth modal
  openModal(type = 'signin') {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('hidden');
    this.showForm(type);
  },

  // Close auth modal
  closeModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.add('hidden');
  },

  // Show specific form
  showForm(type) {
    const forms = ['signInForm', 'signUpForm', 'verificationForm'];
    forms.forEach(formId => {
      const form = document.getElementById(formId);
      if (form) form.classList.add('hidden');
    });

    // Map type to actual form ID (handles 'signup' -> 'signUpForm')
    const formMap = {
      'signin': 'signInForm',
      'signup': 'signUpForm',
      'verification': 'verificationForm'
    };

    const targetFormId = formMap[type] || 'signInForm';
    const targetForm = document.getElementById(targetFormId);
    if (targetForm) targetForm.classList.remove('hidden');
  },

  // Handle sign in
  async handleSignIn() {
    const email = document.getElementById('signInEmail')?.value;
    const password = document.getElementById('signInPassword')?.value;

    if (!email || !password) {
      window.EcoQuestUI.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        const data = await window.EcoQuestAuth.signIn(email, password);
        this.authUser = data.user;
        this.isLoggedIn = true;

        try {
          this.userProfile = await window.EcoQuestAuth.getUserProfile(data.user.id);
        } catch (profileError) {
          this.userProfile = this.createDefaultProfile(data.user);
        }

        this.closeModal();
        this.updateUI();
        window.EcoQuestUI.showToast('Welcome back!', 'success');
      } catch (error) {
        window.EcoQuestUI.showToast(error.message || 'Sign in failed', 'error');
      }
    } else {
      // Demo mode
      this.isLoggedIn = true;
      this.authUser = { id: 'demo_user', email };
      this.userProfile = {
        username: email.split('@')[0],
        display_name: email.split('@')[0],
        total_points: 0,
        submissions: 0,
        current_streak: 0,
        area: null,
        country: null,
        friend_code: 'DEMO1234'
      };

      this.closeModal();
      this.updateUI();
      window.EcoQuestUI.showToast('Demo mode: Signed in!', 'success');
    }
  },

  // Handle sign up
  async handleSignUp() {
    const username = document.getElementById('signUpUsername')?.value;
    const email = document.getElementById('signUpEmail')?.value;
    const password = document.getElementById('signUpPassword')?.value;

    if (!username || !email || !password) {
      window.EcoQuestUI.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password.length < 6) {
      window.EcoQuestUI.showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        await window.EcoQuestAuth.signUp(email, password, username, username);
        this.showForm('verification');
        window.EcoQuestUI.showToast('Check your email for verification!', 'success');
      } catch (error) {
        window.EcoQuestUI.showToast(error.message || 'Sign up failed', 'error');
      }
    } else {
      // Demo mode
      this.isLoggedIn = true;
      this.authUser = { id: 'demo_user', email };
      this.userProfile = {
        username,
        display_name: username,
        total_points: 0,
        submissions: 0,
        current_streak: 0,
        friend_code: 'DEMO1234'
      };

      this.closeModal();
      this.updateUI();
      window.EcoQuestUI.showToast('Demo mode: Account created!', 'success');
    }
  },

  // Handle sign out
  async handleSignOut() {
    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        await window.EcoQuestAuth.signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }

    this.isLoggedIn = false;
    this.authUser = null;
    this.userProfile = null;
    this.updateUI();
    window.EcoQuestUI.showToast('Signed out', 'success');
  },

  // Update UI based on auth state
  updateUI() {
    const authBanner = document.getElementById('authBanner');
    const authBtn = document.getElementById('authBtn');
    const profileLoggedOut = document.getElementById('profileLoggedOut');
    const profileLoggedIn = document.getElementById('profileLoggedIn');

    if (this.isLoggedIn) {
      if (authBanner) authBanner.classList.add('hidden');
      if (authBtn) authBtn.textContent = '👤';
      if (profileLoggedOut) profileLoggedOut.classList.add('hidden');
      if (profileLoggedIn) profileLoggedIn.classList.remove('hidden');

      this.updateProfileSection();
    } else {
      if (authBanner) authBanner.classList.remove('hidden');
      if (authBtn) authBtn.textContent = '👤';
      if (profileLoggedOut) profileLoggedOut.classList.remove('hidden');
      if (profileLoggedIn) profileLoggedIn.classList.add('hidden');
    }
  },

  // Update profile section
  updateProfileSection() {
    const profile = this.userProfile;
    if (!profile) return;

    const elements = {
      profileName: document.getElementById('profileName'),
      profileEmail: document.getElementById('profileEmail'),
      profileTotalPoints: document.getElementById('profileTotalPoints'),
      profileSubmissions: document.getElementById('profileSubmissions'),
      profileStreak: document.getElementById('profileStreak'),
      profileArea: document.getElementById('profileArea'),
      profileFriendCode: document.getElementById('profileFriendCode')
    };

    if (elements.profileName) elements.profileName.textContent = profile.display_name || profile.username;
    if (elements.profileEmail) elements.profileEmail.textContent = this.authUser?.email || '';
    if (elements.profileTotalPoints) elements.profileTotalPoints.textContent = profile.total_points || 0;
    if (elements.profileSubmissions) elements.profileSubmissions.textContent = profile.submissions || 0;
    if (elements.profileStreak) elements.profileStreak.textContent = profile.current_streak || 0;
    if (elements.profileArea) elements.profileArea.textContent = profile.area || 'Not set';
    if (elements.profileFriendCode) elements.profileFriendCode.textContent = profile.friend_code || '--------';
  }
};

// Export
window.EcoQuestAuthUI = AuthModule;
