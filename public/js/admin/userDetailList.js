import { showToast } from '../toast.js';


window.onload = function () {
	console.log("here");
	// deleteVehicle(2);
	axios.get('/fetchAllAgents').then(res => {
		console.log(res);
		let tdataArray = res.data.map((curr, i) => `<tr class='clearfix'><td>${++i}</td><td> ${curr.agent_name}</td><td>${curr.agent_mobile}</td><td>${curr.agent_address} ${curr.agent_city} ${curr.agent_zip_code} ${curr.agent_state}</td><td>${curr.agent_company_name}</td><td>${curr.agent_registration_type}</td><td>${curr.agent_bookin_city.join(', ')}</td><td>${curr.agent_drop_city.join(', ')}</td></tr>`);
		let tdata = tdataArray.join('');
		document.querySelector('.userDetails').innerHTML = tdata;
	})
}



function init() {
	// fetchVehicleList();
	// eventListeners();	
}
init();