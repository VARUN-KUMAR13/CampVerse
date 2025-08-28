# 🔥 Firebase Authentication Setup Guide

Your Firebase project credentials are configured, but Authentication needs to be enabled in the Firebase Console. Follow these steps:

## 🚀 **Step 1: Access Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **`campverse-1374`**

## 🔐 **Step 2: Enable Authentication**

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"** if this is your first time
3. Go to the **"Sign-in method"** tab

## ✅ **Step 3: Enable Email/Password Authentication**

1. Click on **"Email/Password"**
2. **Enable** the first toggle (Email/Password)
3. Leave "Email link (passwordless sign-in)" **disabled** for now
4. Click **"Save"**

## 👤 **Step 4: Create Test Users (Optional)**

### Method A: Manual User Creation
1. Go to **"Users"** tab in Authentication
2. Click **"Add user"**
3. Add these test users:

```
Email: admin@cvr.ac.in
Password: admin
```

```
Email: 22B81A05C3@cvr.ac.in  
Password: 22B81A05C3
```

### Method B: Allow Sign-up (Recommended)
1. In **"Settings"** → **"General"** tab
2. Enable **"Create new users"** if you want students to register themselves

## 🔒 **Step 5: Configure Security Rules (Important)**

1. Go to **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select your preferred location (closest to your users)

## ⚙️ **Step 6: Set Up Firestore Security Rules**

Go to **"Rules"** tab in Firestore and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read courses
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.faculty == request.auth.token.email;
    }
    
    // Allow authenticated users to read/write assignments
    match /assignments/{assignmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 **Step 7: Test Authentication**

After completing the setup:

1. **Restart your app** (already done)
2. Try logging in with:
   - **Admin**: `admin` / `admin`
   - **Student**: `22B81A05C3` / `22B81A05C3`

## 🛠️ **Current App Status**

✅ **Firebase credentials configured**  
✅ **Development mode fallback active** (app works even without Firebase setup)  
✅ **Error handling improved** (graceful fallback to mock users)  
✅ **Auto-creates users** if they don't exist  

## 🔄 **Switching to Production Mode**

Once Firebase Authentication is properly set up:

1. Test login works in Firebase Console
2. Switch back to production mode:
   ```bash
   # This will be done automatically for you
   VITE_NODE_ENV=production
   ```

## ⚠️ **Common Issues & Solutions**

### Issue: "auth/network-request-failed"
- **Cause**: Authentication not enabled in Firebase Console
- **Solution**: Follow Steps 2-3 above

### Issue: "auth/user-not-found"  
- **Cause**: User doesn't exist in Firebase Authentication
- **Solution**: Create users manually or enable sign-up (Step 4)

### Issue: "auth/wrong-password"
- **Cause**: Incorrect password for existing user
- **Solution**: Use correct password or reset password

## 🎓 **User Creation Pattern**

Your app follows this pattern:
- **College ID**: `22B81A05C3` (Year + College + Section + Branch + Roll)
- **Email**: `22B81A05C3@cvr.ac.in`
- **Default Password**: Same as College ID (`22B81A05C3`)

## ✨ **What Happens After Setup**

1. **Real-time authentication** with Firebase
2. **Secure user data** in Firestore
3. **Custom student dashboards** with personal data
4. **Dataset import/export** functionality
5. **Email notifications** for contact forms

## 🆘 **Need Help?**

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all steps in Firebase Console are completed
3. The app will automatically fall back to development mode if Firebase isn't ready

Your app is **currently working** in development mode with mock users while you set up Firebase! 🎉
