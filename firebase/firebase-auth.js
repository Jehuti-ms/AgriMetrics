// Firebase Authentication Service
const FirebaseAuth = {
    // Auth state observer
    onAuthStateChanged: function(callback) {
        firebase.auth().onAuthStateChanged(callback);
    },

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
                }).then(() => {
                    // Create user document in Firestore
                    return FirestoreService.createUserProfile(userCredential.user.uid, {
                        displayName: displayName,
                        email: email,
                        farmName: farmName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
            });
    },

    // Sign in with Google
    signInWithGoogle: function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        return firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Create user profile if it's a new user
                const user = result.user;
                return FirestoreService.getUserProfile(user.uid)
                    .then((profile) => {
                        if (!profile.exists) {
                            return FirestoreService.createUserProfile(user.uid, {
                                displayName: user.displayName,
                                email: user.email,
                                farmName: `${user.displayName}'s Farm`,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    });
            });
    },

    // Sign out
    signOut: function() {
        return firebase.auth().signOut();
    },

    // Send password reset email
    sendPasswordResetEmail: function(email) {
        return firebase.auth().sendPasswordResetEmail(email);
    },

    // Update password
    updatePassword: function(newPassword) {
        return firebase.auth().currentUser.updatePassword(newPassword);
    },

    // Reauthenticate user (for sensitive operations)
    reauthenticate: function(password) {
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            password
        );
        return user.reauthenticateWithCredential(credential);
    },

    // Get current user
    getCurrentUser: function() {
        return firebase.auth().currentUser;
    }
};
