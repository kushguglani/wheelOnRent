document.querySelector('#uploadDocuments').addEventListener('click',uploadDocument);

function uploadDocument(){
	let profilePhoto = document.querySelector('#profilePhoto').files[0];
	let docs = document.querySelector('#docs').files;
	console.log(profilePhoto);
	console.log(docs);
	// let agentID = localStorage.getItem('agent_id');
	let uploadData = new FormData();
	// uploadData.set('_id',agentID);
	uploadData.append('image', profilePhoto)
	// console.log(uploadData);
	axios({
		method:'post',
		url:'/uploadProfile',
		data: uploadData,
		config: { headers: { 'Content-Type': 'multipart/form-data' }}
	}).then(res=>{
		console.log(res);
	})
}