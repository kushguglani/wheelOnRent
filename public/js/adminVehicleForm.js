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

function deleteVehicle(id) {
    // let vehicleName = document.querySelector('#deleteVehicle');
    console.log("Sasas");
    console.log(id);
    axios.post('/deleteVehicle', { id }).then(res => {
        if (res.data.error) showToast(res.data.message, "info");
        else if (res.status === 200) {
            showToast(`Vehicle deleted successfully`, "success");
            fetchVehicleList();
        }

    })
        .catch(e => {
            console.log(e);
            showToast(e.message, "error");
        })
}

function eventListeners() {
    document.querySelector('#submitVehicleDetailsForm').addEventListener('click', submitVehicleDetailsForm);
}

function fetchVehicleList() {
    axios.get('/fetchVehicleType').then(res => {
        console.log(res);
        let tdataArray
        if(res.data.msz === "empty"){
            tdataArray = `<h4>No vehicle exists</h4>`;

            document.querySelector('.vehicleDetails').innerHTML = tdataArray;
        }
        else{
             tdataArray = res.data.map((curr, i) => `<tr class='clearfix'><td >${++i} </td><td class=''>${curr.vehicle_name}</td><td>${curr.vehicle_type}</td><td>${curr.vehicle_name}</td><td><a onclick='deleteVehicle("${curr._id}")';  id='deleteVehicle1'><i class='fas fa-trash'></i></span></a></td></tr>`);
        console.log(tdataArray);
        let tdata = tdataArray.join('');
        
        document.querySelector('.vehicleDetails').innerHTML = tdata;
        }
    })
}

window.onload = function () {
    window.deleteVehicle = deleteVehicle;
    fetchVehicleList();
}



function init() {
    // fetchVehicleList();
    eventListeners();
}
init();