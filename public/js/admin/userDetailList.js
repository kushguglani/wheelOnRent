import { showToast } from '../toast.js';


window.onload = function () {
	console.log("here");
	// deleteVehicle(2);
	axios.get('/fetchAllAgents').then(res => {
		console.log(res);
		let tdataArray = res.data.map((curr, i) => `<tr class='clearfix'><td>${++i}</td><td> ${curr.agent_name}</td><td>${curr.agent_mobile}</td><td>${curr.agent_address} ${curr.agent_city} ${curr.agent_zip_code} ${curr.agent_state}</td><td>${curr.agent_company_name}</td><td>${curr.agent_registration_type}</td><td>${curr.agent_company_registration_number}</td><td>${curr.agent_service_city.join(', ')}</td><td>${curr.agent_vehicle_type.join(', ')}</td><td>${curr.agent_number_of_vehicle}</td><td>${curr.profilePic ? 'Uploaded' : 'No profile pic'}</td><td>${curr.docs ? 'Uploaded' : 'No docs uploaded'}</td></tr>`);
		let tdata = tdataArray.join('');
		document.querySelector('.userDetails').innerHTML = tdata;
	})
}



function init() {
	// fetchVehicleList();
	// eventListeners();	
}
init();