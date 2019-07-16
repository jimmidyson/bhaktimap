import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();

export const db = firebase.firestore();
