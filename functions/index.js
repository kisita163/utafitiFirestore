/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START import]
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const request = require('request'); 
// [END import]

admin.initializeApp();


//Listens for devices 
exports.devices = functions.database.ref('/devices/{deviceId}/state')
  .onWrite((change, context) => {
	
  // Grab the current value of what was written to the Realtime Database.
  console.log(context.params.deviceId);
  
  return null;
});

function newSurveyAlert(metadata){
	
	var filename = metadata[0]['name'];                     
	var md5Hash  = metadata[0]['md5Hash'];
	var message  = 
	{
		data: 
		{
			name: filename,
			hash: md5Hash
	    },
	     topic: 'survey'
	};
	
	var promise = admin.messaging().send(message);
	promise.then(onMessageAlertSuccess,onMessageAlertFailure).catch(onMessageAlertFailure);
}

function newSurveyAlertTest(metadata){
	
	var filename = metadata[0]['name'];                     
	var md5Hash  = metadata[0]['md5Hash'];
	var message  = 
	{
		data: 
		{
			name: filename,
			hash: md5Hash
	    },
	     topic: 'surveyTest'
	};
	
	var promise = admin.messaging().send(message);
	promise.then(onMessageAlertSuccess,onMessageAlertFailure).catch(onMessageAlertFailure);
}

function onMessageAlertSuccess(reponse){
	console.log("Message sent successfuly",reponse);
}


function onMessageAlertFailure(error){
	console.log('Error sending message:', error);
}

exports.currentSurvey = functions.storage.object().onFinalize( async (object) => {
	// Create storage reference
	var storage    = admin.storage().bucket();
	var surveyRef;
    
		
	if (object.name === 'current_survey/survey.json'){
		
		surveyRef  = storage.file('current_survey/survey.json');
		
		// Get metadata properties
		const promise  = surveyRef.getMetadata();
		
		promise.then(newSurveyAlert,null).catch(onMessageAlertFailure);
	}

	if (object.name === 'current_survey_test/survey.json'){
		
		surveyRef  = storage.file('current_survey_test/survey.json');
		
		// Get metadata properties
		const promise  = surveyRef.getMetadata();
		
		promise.then(newSurveyAlertTest,null).catch(onMessageAlertFailure);
	}
});
