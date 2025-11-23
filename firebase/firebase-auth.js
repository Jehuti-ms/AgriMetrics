// firebase/firebase-auth.js - Simplified version
const FirebaseAuth = {
    // Sign in with email and password
    signInWithEmail: function(email, password) {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    },

    // Sign up with email and password
    signUpWithEmail: function(email, password, displayName, farmName) {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update user profile
                return userCredential.user.updateProfile({
                    displayName: displayName
                });
            });
    },

    // Sign in with Google
    signInWithGoogle: function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        return firebase.auth().signInWithPopup(provider);
    },

    // Sign out
    signOut: function() {
        return firebase.auth().signOut();
    },

    // Send password reset email
    sendPasswordResetEmail: function(email) {
        return firebase.auth().sendPasswordResetEmail(email);
    },

    // Get current user
    getCurrentUser: function() {
        return firebase.auth().currentUser;
    }
};
