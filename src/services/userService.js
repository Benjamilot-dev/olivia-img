import { ref, get, set, update, remove, onValue } from 'firebase/database';
import { database } from '../firebase/config';

const STORAGE_ADMIN_KEY = 'olivia_is_admin';
const STORAGE_STATUS_KEY = 'olivia_user_status';

/**
 * Sync user profile to Firebase Realtime Database and resolve role and status
 * - Role: 'admin' | 'user'
 * - Status: 'approved' | 'pending' | 'rejected'
 * 
 * Rules:
 * - If role in Firebase is 'admin' (set via console or DB), status is automatically 'approved'
 * - If user already exists in DB, keep their assigned role and status
 * - If it's the very first user (site creator), assign 'admin' and 'approved'
 * - Any new user registering is set to 'user' with status: 'pending' (must be approved by admin)
 */
export const syncUserToDatabase = async (user) => {
  if (!user || !user.uid) {
    return { role: 'user', status: 'pending', isAdmin: false, isApproved: false };
  }

  try {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    let role = 'user';
    let status = 'pending';

    if (snapshot.exists()) {
      const data = snapshot.val();
      role = data.role || 'user';
      status = role === 'admin' ? 'approved' : (data.status || 'pending');

      // Update last login and profile info
      await update(userRef, {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString()
      });
    } else {
      // Check if there are any existing users in the database
      const allUsersSnap = await get(ref(database, 'users'));
      const existingUsers = allUsersSnap.exists() ? allUsersSnap.val() : {};
      const hasAnyAdmins = Object.values(existingUsers).some((u) => u.role === 'admin');

      // If no admin exists yet in database, the first user is granted 'admin' and 'approved'
      if (!hasAnyAdmins) {
        role = 'admin';
        status = 'approved';
      } else {
        // Any new user is registered as pending approval
        role = 'user';
        status = 'pending';
      }

      await set(userRef, {
        uid: user.uid,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: role,
        status: status,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    }

    const isAdmin = role === 'admin';
    const isApproved = isAdmin || status === 'approved';

    localStorage.setItem(STORAGE_ADMIN_KEY, isAdmin ? 'true' : 'false');
    localStorage.setItem(STORAGE_STATUS_KEY, status);

    return { role, status, isAdmin, isApproved };
  } catch (error) {
    console.warn("User database sync warning:", error.message);
    const savedAdmin = localStorage.getItem(STORAGE_ADMIN_KEY) === 'true';
    const savedStatus = localStorage.getItem(STORAGE_STATUS_KEY) || (savedAdmin ? 'approved' : 'pending');
    return {
      role: savedAdmin ? 'admin' : 'user',
      status: savedStatus,
      isAdmin: savedAdmin,
      isApproved: savedAdmin || savedStatus === 'approved'
    };
  }
};

/**
 * Subscribe to real-time changes in user's profile, role, and approval status
 */
export const subscribeUserRole = (uid, onRoleChange) => {
  if (!uid) return () => {};
  try {
    const userRef = ref(database, `users/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const role = data.role || 'user';
        const status = role === 'admin' ? 'approved' : (data.status || 'pending');
        const isAdmin = role === 'admin';
        const isApproved = isAdmin || status === 'approved';

        localStorage.setItem(STORAGE_ADMIN_KEY, isAdmin ? 'true' : 'false');
        localStorage.setItem(STORAGE_STATUS_KEY, status);

        onRoleChange({ role, status, isAdmin, isApproved });
      }
    });
    return unsubscribe;
  } catch {
    return () => {};
  }
};

/**
 * Fetch all registered users from database (Admin only)
 */
export const getAllUsers = async () => {
  try {
    const usersSnap = await get(ref(database, 'users'));
    if (usersSnap.exists()) {
      return Object.values(usersSnap.val());
    }
  } catch (e) {
    console.warn("Could not fetch users list:", e);
  }
  return [];
};

/**
 * Update user status in Firebase (Admin only: approve or reject)
 * @param {string} targetUid 
 * @param {'approved' | 'rejected' | 'pending'} newStatus 
 * @param {string} adminName 
 */
export const updateUserStatus = async (targetUid, newStatus, adminName = 'Admin') => {
  try {
    await update(ref(database, `users/${targetUid}`), {
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Update user role in Firebase (Admin only)
 */
export const changeUserRole = async (targetUid, newRole) => {
  try {
    const updates = {
      role: newRole,
      updatedAt: new Date().toISOString()
    };
    // If made admin, also ensure status is approved
    if (newRole === 'admin') {
      updates.status = 'approved';
    }
    await update(ref(database, `users/${targetUid}`), updates);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Delete user from Firebase database (Admin only)
 */
export const deleteUserFromDatabase = async (targetUid) => {
  try {
    await remove(ref(database, `users/${targetUid}`));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
