import { showToast } from './toast.js';

function submitVehicleDetailsForm() {
    let vehicleName = document.querySelector('#inputVehicleName').value;
    let vehicleType = document.querySelector('#inputVehicleType').value;
    let numberOfSeats = document.querySelector('#inputVehicleSeats').value;

    if (vehicleName === "" || vehicleType === "" || numberOfSeats === "") showToast("Please fill all the details", "error");
    else {
        let adminVehicleFrom = {
            'vehicle_name': vehicleName,
            'vehicle_type': vehicleType,
            'vehicle_number_of_seats': numberOfSeats,
            'status':1
        }
        axios.post('/submitVehicleDetails', adminVehicleFrom).then(res => {
            if (res.data.error) showToast(res.data.message, "info");
            else if (res.status === 200) {
                showToast(`Vehicle ${res.data.vehicle_name} insreted successfully`, "success");
                fetchVehicleList();
            }

        })
            .catch(e => {
                console.log(e);
                showToast(e.message, "error");
            })
    }
}


function deleteVehicle(id) {
    // let vehicleName = document.querySelector('#deleteVehicle');
    console.log("Sasas");
    console.log(id);
    return;
    let vehicleType = document.querySelector('#inputVehicleType').value;
    let numberOfSeats = document.querySelector('#inputVehicleSeats').value;

    if (vehicleName === "" || vehicleType === "" || numberOfSeats === "") showToast("Please fill all the details", "error");
    else {
        let adminVehicleFrom = {
            'vehicle_name': vehicleName,
            'vehicle_type': vehicleType,
            'vehicle_number_of_seats': numberOfSeats,
            'status': 1
        }
        axios.post('/submitVehicleDetails', adminVehicleFrom).then(res => {
            if (res.data.error) showToast(res.data.message, "info");
            else if (res.status === 200) {
                showToast(`Vehicle ${res.data.vehicle_name} insreted successfully`, "success");
                fetchVehicleList();
            }

        })
            .catch(e => {
                console.log(e);
                showToast(e.message, "error");
            })
    }
}



function eventListeners() {
    document.querySelector('#submitVehicleDetailsForm').addEventListener('click', submitVehicleDetailsForm);
}

window.onload = function () {
    console.log("here")
    deleteVehicle(2);
    axios.get('/fetchVehicleType').then(res => {
        let tdataArray = res.data.map((curr, i) => "<tr class='clearfix'><td class=''>" + i + "</td><td class=''>" + curr.vehicle_name + "</td><td class=''>" + curr.vehicle_type + "</td><td class=''>" + curr.vehicle_number_of_seats + "</td><td><a onclick='alert(3);deleteVehicle(2);'  id='deleteVehicle1'><i class='fas fa-trash'></i></span></a></td></tr>");
        let tdata = tdataArray.join('');
        document.querySelector('.vehicleDetails').innerHTML = tdata;
    })
}



function init() {
    // fetchVehicleList();
    eventListeners();
}
init();