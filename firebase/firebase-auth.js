// firebase/firebase-auth.js - Complete implementation
const FirebaseAuth = {
    // Auth state observer
    onAuthStateChanged: function(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    },

    // Sign in with email and password
    signInWithEmail: function(email, password) {
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User signed in:', userCredential.user.email);
                return userCredential;
            })
            .catch((error) => {
                console.error('Sign in error:', error);
                throw error;
            });
    },

    // Sign up with email and password
    signUpWithEmail: function(email, password, displayName, farmName) {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User created:', userCredential.user.email);
                
                // Update user profile
                return userCredential.user.updateProfile({
                    displayName: displayName
                }).then(() => {
                    console.log('Profile updated');
                    
                    // Create user document in Firestore
                    return FirestoreService.createUserProfile(userCredential.user.uid, {
                        displayName: displayName,
                        email: email,
                        farmName: farmName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }).then(() => {
                    return userCredential;
                });
            })
            .catch((error) => {
                console.error('Sign up error:', error);
                throw error;
            });
    },

    // Sign in with Google
    signInWithGoogle: function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        return firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log('Google sign in successful:', result.user.email);
                
                const user = result.user;
                // Create user profile if it's a new user
                return FirestoreService.getUserProfile(user.uid)
                    .then((profile) => {
                        if (!profile.exists) {
                            console.log('Creating new user profile for Google user');
                            return FirestoreService.createUserProfile(user.uid, {
                                displayName: user.displayName,
                                email: user.email,
                                farmName: `${user.displayName}'s Farm`,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                                isGoogleUser: true
                            });
                        } else {
                            // Update last login for existing user
                            return FirestoreService.updateUserProfile(user.uid, {
                                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    }).then(() => {
                        return result;
                    });
            })
            .catch((error) => {
                console.error('Google sign in error:', error);
                throw error;
            });
    },

    // Sign out
    signOut: function() {
        return firebase.auth().signOut()
            .then(() => {
                console.log('User signed out');
            })
            .catch((error) => {
                console.error('Sign out error:', error);
                throw error;
            });
    },

    // Send password reset email
    sendPasswordResetEmail: function(email) {
        return firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                console.log('Password reset email sent to:', email);
            })
            .catch((error) => {
                console.error('Password reset error:', error);
                throw error;
            });
    },

    // Update password
    updatePassword: function(newPassword) {
        const user = firebase.auth().currentUser;
        return user.updatePassword(newPassword)
            .then(() => {
                console.log('Password updated successfully');
            })
            .catch((error) => {
                console.error('Password update error:', error);
                throw error;
            });
    },

    // Reauthenticate user (for sensitive operations)
    reauthenticate: function(password) {
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            password
        );
        return user.reauthenticateWithCredential(credential)
            .then(() => {
                console.log('User reauthenticated');
            })
            .catch((error) => {
                console.error('Reauthentication error:', error);
                throw error;
            });
    },

    // Get current user
    getCurrentUser: function() {
        return firebase.auth().currentUser;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return !!firebase.auth().currentUser;
    },

    // Get auth token (useful for API calls)
    getIdToken: function() {
        const user = firebase.auth().currentUser;
        if (user) {
            return user.getIdToken();
        }
        return Promise.resolve(null);
    }
};
