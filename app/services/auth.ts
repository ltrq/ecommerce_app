import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../utils/firebase';

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Sign-up error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Sign-in error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error: unknown) {
    console.error('Logout error:', error);
    throw error;
  }
};
