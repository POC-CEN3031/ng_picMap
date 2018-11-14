import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class AuthService {
  public user: Observable<firebase.User>;
  public userDetails: firebase.User = null;

  constructor(private _firebaseAuth: AngularFireAuth, private router: Router, private _firestore: AngularFirestore) {
    this.user = _firebaseAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
          console.log(this.userDetails);
        }
        else {
          this.userDetails = null;
        }
      }
    );
  }

  register(email, password, fullName, company) {
    return this._firebaseAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(
        (afUser: firebase.User) => {
          // Update the profile in firebase auth
          afUser.updateProfile({
            displayName: fullName,
            photoURL: ""
          }).then(() => afUser.sendEmailVerification());
          // Create the user in firestore
          this._firestore.firestore.collection("users").doc(afUser.uid).set(
            {

              uid: afUser.uid,
              company: company,
              email: email,
              fullName: fullName,
              password: password

            }
          );
        });
  }

  requestPass(email) {
    return this._firebaseAuth.auth.sendPasswordResetEmail(email);
  }

  confirmPasswordReset(code, newPassword) { // param: oobCode=<code>
    return this._firebaseAuth.auth.confirmPasswordReset(code, newPassword);
  }

  /*verifyPasswordResetCode(code){
    return this._firebaseAuth.auth.verifyPasswordResetCode(code);
  }*/

  signInWithEmail(email, password) {
    return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }
  signInWithTwitter() {
    return this._firebaseAuth.auth.signInWithPopup(
      new firebase.auth.TwitterAuthProvider()
    )
  }
  signInWithFacebook() {
    return this._firebaseAuth.auth.signInWithPopup(
      new firebase.auth.FacebookAuthProvider()
    )
  }
  signInWithGoogle() {
    return this._firebaseAuth.auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    )
  }

  isLoggedIn() {
    if (this.userDetails == null) {
      return '/auth/login';
    } else {
      return true;
    }
  }
  logout() {
    this._firebaseAuth.auth.signOut()
      .then((res) => this.router.navigate(['/auth/login']));
  }
}