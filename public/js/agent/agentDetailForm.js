import { states } from '../ext/state.js';
import { showToast } from '../toast.js';

function regTypeChange(value) {
	console.log(value);
	if (value === "Taxi" || value === "Bus") {
		let elements = document.querySelectorAll('.busDefault');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.display = 'initial';
		}
		var options = [], data;
		fetchVehicles().then(res => {
			data = res.data;
			console.log(data);
			if (value === "Taxi") {
				for (let i = 0; i < data.length; i++) {
					console.log(data[i].vehicle_type);
					if (data[i].vehicle_type === "Taxi")
						options.push({ label: data[i].vehicle_name, title: data[i].vehicle_name, value: data[i].vehicle_name })
				}
				console.log(options);
				$('#vehicleType').multiselect();

				$('#vehicleType').multiselect('dataprovider', options);
			}
			else if (value === "Bus") {
				for (let i = 0; i < data.length; i++) {
					if (data[i].vehicle_type === "Bus")
						options.push({ label: data[i].vehicle_name, title: data[i].vehicle_name, value: data[i].vehicle_name })
				}
				console.log(options);
				$('#vehicleType').multiselect();

				$('#vehicleType').multiselect('dataprovider', options);
			}
		});

		// 	fetchVehicles().then(res=>{
		// 		var options = [];
		// 		for (let i = 0; i < res.data.length; i++) {
		// 			options.push({ label: res.data[i].vehicle_name, title: res.data[i].vehicle_name, value: res.data[i].vehicle_name })
		// 		}
		// 		console.log(options);
		// 		$('#vehicleType').multiselect();

		// 		$('#vehicleType').multiselect('dataprovider', options);
		// 	})
	} else {
		let elements = document.querySelectorAll('.busDefault');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.display = 'none';
		}

	}
}

function termsAndConditionsChecked() {
	let terms = document.querySelector('#gridCheck').checked;
	if (terms) document.querySelector('#submitDetailsForm').disabled = false
	else document.querySelector('#submitDetailsForm').disabled = true
};
function submitAgentDetailsForm() {

	let name = document.querySelector('#inputName').value;
	let contact = document.querySelector('#inputContact').value;
	let address = document.querySelector('#inputAddress').value;
	let city = document.querySelector('#inputCity').value;
	let state = document.querySelector('#inputStateForm').value;
	let zip = document.querySelector('#inputZip').value;
	let companyName = document.querySelector('#companyName').value;
	let companyRegNo = document.querySelector('#companyRegNo').value;
	let companyRegType = document.querySelector('#companyRegType').value; 
	let numberOfVehicles = document.querySelector('#numberOfVehicles').value;
	let inputEmail = document.querySelector('#inputEmail').value;
	let bookingCities = [];
	// let dropCities = [];
	let vehicleType = [];
	// let profilePhoto = document.querySelector('#profilePhoto').value;
	// let docs = document.querySelector('#docs').files;
	// let docsName = [];
	// for(let i=0;i<docs.length;i++){
	// 	docsName[i]=docs[i];
	// }

	// let formData =  document.querySelectorAll('.form-control');
	// let form = [...formData].map(curr=> {return {[curr.id]: curr.value}});

	$("#vehicleType :selected").each(function () {
		vehicleType.push($(this).val());
	});
	$("#bookingCities :selected").each(function () {
		bookingCities.push($(this).val());
	});
	// $("#dropCities :selected").each(function () {
	// 	dropCities.push($(this).val());
	// });
	let nameRegex = /^[a-zA-Z ]{2,30}$/;
	let mobileRegex = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
	let ZipCodeRegex = /^\d{6}$/;
	let emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	console.log(numberOfVehicles);
	let agentDetails = {
		"agent_name": name,
		"agent_mobile": contact,
		"agent_email": inputEmail,
		"agent_address": address,
		"agent_city": city,
		"agent_state": state,
		"agent_zip_code": zip,
		"agent_company_name": companyName,
		"agent_company_registration_number": companyRegNo,
		"agent_registration_type": companyRegType,
		"agent_vehicle_type": vehicleType,
		"agent_number_of_vehicle": numberOfVehicles,
		"agent_service_city": bookingCities,
		// "agent_drop_city": dropCities,
		// "agent_profile_photo": profilePhoto,
		// "agent_documents": docsName
	}
	if (!nameRegex.test(name)) return showToast("Name is not valid", "error");
	else if (!mobileRegex.test(contact)) return showToast("Mobile number is not valid", "error");
	else if (!ZipCodeRegex.test(zip)) return showToast("Zip is not valid", "error");
	else if (name === "" || contact === "" || address === "" || city === "" || state === "" || zip === ""
		|| companyName === "" || companyRegType === "" 
		|| bookingCities.length === 0 
	) return showToast("Please fill all the details", "error");
	else if (numberOfVehicles === "" || vehicleType.length === 0){
		if (companyRegType === "Taxi" || companyRegType === "Bus") return showToast("Please fill all the details", "error");
		else
			submitAfterValidations(agentDetails);
	}
	else {
		submitAfterValidations(agentDetails);
	}
}

function submitAfterValidations(agentDetails){
	
	console.log(agentDetails);
	axios.post('/saveAgentFormDetails', agentDetails).then(res => {
		console.log(res);
		if (res.data.error) showToast(res.data.message, "info");
		else if (res.status === 200) {
			showToast(`Agent  ${res.data.agent_name} insreted successfully`, "success");
			// location('agent/uploadDoc.html');
			// window.history.pushState('page2', 'Title', 'uploadDoc.html');
			localStorage.setItem("agent_id", res.data._id);
			window.location.href = 'uploadDocument.html'
		}

	})
		.catch(e => {
			console.log(e);
			showToast(e.message, "error");
		})
}

// add state in select dropdown
function showStatesInDropDown() {
	let html = states.map(curr => "<option value=" + curr.code + ">" + curr.name + "</option>")
	let inputState = document.querySelector('#inputStateForm');
	inputState.insertAdjacentHTML("afterbegin", html);
}
function eventListeners() {
	document.querySelector('#submitDetailsForm').addEventListener('click', submitAgentDetailsForm);
	document.querySelector('#gridCheck').addEventListener('click', termsAndConditionsChecked);

}

export function fetchVehicles() {
	return axios.get('/fetchVehicleType').then(res => {
		// console.log(res);
		return res;
	})
}

window.onload = function (e) {
	window.regTypeChange = regTypeChange;
	let vehicleType = document.querySelector('#vehicleType');

}
function init() {
	showStatesInDropDown();
	eventListeners();
}
init();
// for multi slect drop down
$(function () {
	$('.multiSelectDrop').multiselect({
		buttonText: function (options, select) {
			if (options.length === 0) {
				return 'None Selected';
			}
			if (options.length === select[0].length) {
				return 'All selected (' + select[0].length + ')';
			}
			else if (options.length >= 4) {
				return options.length + ' selected';
			}
			else {
				var labels = [];
				// console.log(labels);
				options.each(function () {
					labels.push($(this).val());
				});
				return labels.join(', ') + '';
			}
		}

	});
});