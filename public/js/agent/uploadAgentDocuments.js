import { showToast } from '../toast.js';

document.querySelector('#uploadProfile').addEventListener('click', uploadProfile);
document.querySelector('#uploadDocuments').addEventListener('click', uploadDocuments);

function uploadProfile() {
	let profilePhoto = document.querySelector('#profilePhoto').files[0];
	console.log(profilePhoto);
	console.log(docs);
	let agentID = localStorage.getItem('agent_id');
	let uploadData = new FormData();
	uploadData.append('_id', agentID);
	uploadData.append('image', profilePhoto)
	// console.log(uploadData);
	axios({
		method: 'post',
		url: '/uploadProfile',
		data: uploadData,
		'content-type': `multipart/form-data; boundary=${uploadData._boundary}`,
	}).then(res => {
		console.log(res);
		showToast(`${res.data.message}`, "success");
	})

}

function uploadDocuments(){
	let docs = document.querySelector('#docs');
	let agentID = localStorage.getItem('agent_id');
	let uploadData = new FormData();
	uploadData.append('_id', agentID);
	for (let i = 0; i < docs.files.length; i++) {
		uploadData.append('image', docs.files[i]);
		console.log(docs.files[i]);
	}
	// console.log(uploadData);
	axios({
		method: 'post',
		url: '/uploadDocs',
		data: uploadData,
		'content-type': `multipart/form-data; boundary=${uploadData._boundary}`,
	}).then(res => {
		console.log(res);
		showToast(`${res.data.message}`, "success");
	})

}