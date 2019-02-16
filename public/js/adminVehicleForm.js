import { showToast } from './toast.js';

function submitVehicleDetailsForm() {
    let vehicleName = document.querySelector('#inputVehicleName').value;
    let vehicleType = document.querySelector('#inputVehicleType').value;
    let numberOfSeats = document.querySelector('#inputVehicleSeats').value;

    if (vehicleName === "" || vehicleType === "" || numberOfSeats === "") showToast("Please fill all the details", "error");
    else {
        console.log("submit form");
        let adminVehicleFrom = {
            'vehicle_name': vehicleName, 
            'vehicle_type': vehicleType, 
            'vehicle_number_of_seats': numberOfSeats
        }
        axios.post('/submitVehicleDetails', adminVehicleFrom).then(res => {
            console.log(res);
            if (res.data.error) showToast(res.data.message, "info");
            else if(res.status===200) showToast(`Vehicle ${res.data.vehicle_name} insreted successfully`, "success");
            
        })
        .catch(e=>{
            console.log(e);
            showToast(e.message, "error");
        })
    }
}

function eventListeners() {
    document.querySelector('#submitVehicleDetailsForm').addEventListener('click', submitVehicleDetailsForm);
}

function init() {
    eventListeners();
}
init();