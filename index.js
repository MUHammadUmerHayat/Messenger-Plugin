'use strict';

// const { request } = require('express');

// Imports dependencies and set up http server

const
	express = require('express'),
	firebase = require('firebase'),
	fs = require('fs'),
	Blob = require('node-blob'),
	LocalStorage = require('node-localstorage').LocalStorage,
	bodyParser = require('body-parser'),
	fetch = require('node-fetch'),
	//admin = require("@")
	storage2 = require('@firebase/storage'),
	app = express().use(bodyParser.json()),
	request = require('request')
	; // creates express http server
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
	projectId: 'todo-app-25565',
	keyFilename: 'serviceAccountKey.json',
});
const bucket =
	storage.bucket('gs://todo-app-25565.appspot.com');
let code = 'no code';
//app.use(express.urlencoded({ extended: true }))
const imageFilter = function (req, file, cb) {
	// Accept images only
	//console.log(file)
	if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
		req.fileValidationError = 'Only image files are allowed!';
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};

var firebaseConfig = {
	apiKey: "AIzaSyAlFGoZEPc0rEYAYiUTnNYZmDbnkQdP20c",
	authDomain: "todo-app-25565.firebaseapp.com",
	databaseURL: "https://todo-app-25565.firebaseio.com",
	projectId: "todo-app-25565",
	storageBucket: "gs://todo-app-25565.appspot.com",
	messagingSenderId: "600592089866",
	appId: "1:600592089866:web:1535bd7732529489"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let storagedb = firebase.storage()
let db = firebase.database()
//var localStorage = new LocalStorage('./scratch');
// Creates the endpoint for our webhook 
//admin.initializeApp({
//	credential: admin.credential.applicationDefault(),
//	databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
//  });
const multer = require('multer');
const Multerstorage = multer.diskStorage({
	destination: function (req, file, cb) {
		//console.log(file, req)
		cb(null, __dirname + '/Images');
	},
	filename: function (req, file, cb) {
		//console.log(file, req)
		cb(null, (new Date).getTime() + file.originalname);
	}
});

const upload = multer({
	storage: Multerstorage
});
const uploader = multer({
	storage: multer.memoryStorage(),
	dest: __dirname + '/Images/',
	limits: {
		fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
	},
	fileFilter: imageFilter
});

app.post('/webhook', (req, res) => {

	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === 'page') {
		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function (entry) {

			// Gets the message. entry.messaging is an array, but 
			// will only ever contain one message, so we get index 0
			let webhook_event = entry.messaging[0];
			let Code = localStorage.getItem('checkout_order_code')
			let PSID = webhook_event.sender.id;
			//console.log(Code)
			var textmes = webhook_event.message.text
			if (PSID && textmes === code && code !== 'no code') {
				for (var i = 0; i < 4; i++) {
					postBack(PSID)
				}
			}
			//console.log({ webhook_event: entry, messaging: webhook_event });
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send(body);
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});
function postBack(PSID) {
	request({
		"uri": "https://graph.facebook.com/v7.0/me/messages",
		"qs": { "access_token": "EAADt1tZAb88cBAMfxyN1kHBld42Gywv7Sq5ZBhWAP9AZAcjEZAZALhwfyZBym3sEvRGavqdlmZBL5ZBZAgMMFD7ZCDUP6uxwcSWNfIthMn2PCQB8zfAa4XABGtSOVKtdSDvAaoy3GM55cweSshyqkccz1aoG2etgJ0azdbGImvYJf4CaqsIiPeKeLs" },
		"method": "POST",
		"json": {
			recipient: {
				// id: "3273760249321146"    saqib id
				id: PSID
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements: [
							{
								title: "Welcome!",
								image_url: "https://4.img-dpreview.com/files/p/TS1200x900~sample_galleries/4973291808/1885203361.jpg",
								subtitle: "We have the right hat for everyone.",
								default_action: {
									type: "web_url",
									url: "https://4.img-dpreview.com/files/p/TS1200x900~sample_galleries/4973291808/1885203361.jpg",
									webview_height_ratio: "tall"
								},
								buttons: [
									{
										type: "web_url",
										url: "https://e-commerce-theme-cfa2d.web.app/",
										title: "View Website"
									}, {
										type: "postback",
										title: "Start Chatting",
										payload: "DEVELOPER_DEFINED_PAYLOAD"
									}
								]
							}
						]
					}
				}
			}
		}

	}, (err, res, body) => {
		if (!err) {
			//console.log('message sent!')
		} else {
			//console.log({ err, res })
		}
	})
}
// Adds support for GET requests to our webhook

app.get('/webhook', (req, res, next) => {
	//console.log('runn get')
	// Your verify token. Should be a random string.
	let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {

		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Responds with the challenge token from the request
			//console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
});
//function getBase64(img, callback) {
//	const reader = new FileReader();
//	reader.addEventListener('load', () => callback(reader.result));
//	reader.readAsDataURL(img);
//}
// All Api 
app.get('/get_allProducts', (req, res) => {
	firebase.database().ref('all_products').on('value', (snapShot) => {
		res.status(200).send(snapShot.val())
	})
})
app.get('/images', (req, res) => {
	//console.log(req.query.filename)
	var filename = req.query.filename;
	let file_path = __dirname + '/Images/' + filename;
	if (fs.existsSync(file_path)) {
		res.sendFile(file_path)
	} else {
		res.send({
			message: "file not found"
		})
	}
})
var cpUpload = upload.fields([{ name: 'imageUrl', maxCount: 8 }, { name: 'gallery', maxCount: 8 }])
app.post('/admin/post_product', uploader.array('imageUrl', 10), async (req, res, next) => {
	let files = req.files
	//console.log(files)
	try {

		if (req.body) {
			let newUrls = []
			for (var i = 0; i < files.length; i++) {
				const blob = bucket.file((new Date).getTime() + files[i].originalname);
				const blobWriter = await blob.createWriteStream({
					metadata: {
						contentType: files[i].mimetype,
					},
				});
				blobWriter.on('error', (err) => console.log(err.message));

				blobWriter.on('finish', () => {
					// Assembling public URL for accessing the file via HTTP
					const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
						bucket.name
						}/o/${encodeURI(blob.name)}?alt=media`;
					newUrls.push(publicUrl)
					// Return the file name and its public URL
					//res
					//	.status(200)
					//	.send({ fileLocation: publicUrl });
					//if (i == files.length - 1) {
					console.log(publicUrl)
					console.log('runnn')
					firebase.database().ref()
						.child('all_products')
						.child(req.body.code)
						.set({ ...req.body, imageUrl: newUrls }).then((value) => {
						}).catch((err) => {
							if (newUrls.length == files.length) {

								res.send({ success: false, message: err.message })
							}
						})
					//}
				});
				if (i == files.length - 1 ) {
					res.send({ success: true, message: "your data successfully send " })
				}
				blobWriter.end(files[i].buffer);
			}

			// When there is no more data to be consumed from the stream
			//if (newUrls.length == files.length) {
			//	console.log('runnnnnn')

			//}
			//}).catch((err) => console.log(err.message))
			//});
		}
	}
	catch (err) {
		console.log(err.message)
	}
})
app.post('/checkout', (req, res) => {
	if (req.body) {
		firebase.database().ref().child('checkout_orders').child(req.body.code).set(req.body).then((value) => {
			code = req.body.code
			res.send({ success: true, message: `your order is save please send this code ${req.body.code} in our messenger page ` })
		}).catch((err) => {
			res.send({ success: false, message: err.message })
		})
	}
})
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));