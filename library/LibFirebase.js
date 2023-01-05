const fs = require('fs');
const path = require("path");
const firebase = require('firebase-admin');

// const account = fs.readFileSync(path.join(__dirname, '../files/keys/logger-firebase-adminsdk-7tcet-7399bbf4fc.json')); // jadinya buffer
const account = require(path.join(__dirname, '../files/keys/logger-firebase-adminsdk-7tcet-7399bbf4fc.json')); // langsung json
const firebaseAdmin = firebase.initializeApp({
  credential: firebase.credential.cert(account),
  databaseURL: 'https://logger-default-rtdb.asia-southeast1.firebasedatabase.app',
});

class LibFirebase {

  static upLocActiveOrder = 1;
  static upPhotoOtwDrop = 2;
  static upLocIdle = 3;
  static scTfMoney = 6; // success transfer pocket money to driver

  firebaseAdmin = null;

  firebaseInit() {
    const firebase = require('firebase-admin');
    // const account = fs.readFileSync(path.join(__dirname, '../files/keys/logger-firebase-adminsdk-7tcet-7399bbf4fc.json')); // jadinya buffer
    const account = require(path.join(__dirname, '../files/keys/logger-firebase-adminsdk-7tcet-7399bbf4fc.json')); // langsung json
    return firebase.initializeApp({
      credential: firebase.credential.cert(account),
      databaseURL: 'https://logger-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
  }

  /**
   * https://firebase.google.com/docs/cloud-messaging/send-message
   * https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messaging#messagingsendtodevice
   * 
   * https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messagingoptions.md#messagingoptions_interface
   */
  sendToDevice(registrationToken = '', payload = {}, options = {}) {
    // const obj = this;
    return new Promise(async (resolve, reject) => {
      try {
        // console.log('check value => ', obj.firebaseAdmin);
        // if (obj.firebaseAdmin === null) {
        //   // obj.firebaseAdmin = this.firebaseInit();
        //   obj.firebaseAdmin = 'udah di assign';
        // }
        // console.log('check value => ', obj.firebaseAdmin);
        if (!options['priority']) {
          options.priority = 'normal';
        }
        if (!options['timeToLive']) {
          options.timeToLive = 60 * 60 * 24;
        }
        const response = await firebaseAdmin.messaging().sendToDevice(registrationToken, payload, options);
        resolve(response);
        // {
        //   results: [ { error: [FirebaseMessagingError] } ],
        //   canonicalRegistrationTokenCount: 0,
        //   failureCount: 1,
        //   successCount: 0,
        //   multicastId: 7795206774601661000
        // }
      } catch (err) {
        console.log('error sending message');
        reject(err);
      }
    });
  }

}

module.exports = LibFirebase;