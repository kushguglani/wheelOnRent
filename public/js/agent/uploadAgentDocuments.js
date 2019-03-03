import { showToast } from '../toast.js';

document.querySelector('#uploadProfile').addEventListener('click', uploadProfile);
document.querySelector('#uploadDocuments').addEventListener('click', uploadDocuments);
document.querySelector('#submitFeedback').addEventListener('click', submitFeedback);

function uploadProfile() {
	document.querySelector('#spinner').style.display = 'initial';
	let profilePhoto = document.querySelector('#profilePhoto').files[0];
	console.log(profilePhoto);
	if (!profilePhoto) {
		document.querySelector('#spinner').style.display = 'none';
		return showToast("Please choose profile photo", "error");
	}
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
		document.querySelector('#spinner').style.display = 'none';
		showToast(`${res.data.message}`, "success");
	})

}

function uploadDocuments() {
	let docs = document.querySelector('#docs');
	let agentID = localStorage.getItem('agent_id');
	if (docs.files.length === 0) return showToast("Please choose documents", "error");
	document.querySelector('#spinner').style.display = 'initial';
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
		document.querySelector('#spinner').style.display = 'none';
		showToast(`${res.data.message}`, "success");
	})

}

function submitFeedback() {
	let agentFeedback = document.querySelector('#agentFeedback').value;
	let agentID = localStorage.getItem('agent_id');
	if (agentFeedback === "") return showToast("Feedback can't be empty", "error");
	axios.post('/submitFeedback', { agentFeedback, agentID }).then(res => {
		console.log(res);
		// if (res.data.error) showToast(res.data.message, "info");
		// else if (res.status === 200) {
		showToast(res.data.status, "success");
		// 	// localStorage.setItem("agent_id", res.data._id);
		// 	// window.location.href = 'uploadDocument.html'
		// }

	})
		.catch(e => {
			console.log(e);
			showToast(e.message, "error");
		})
}