window.addEventListener('load', () => {

    buildVehicleTable();
    refreshVehicleForm();
    restrictFutureDays();

});

//global var to store id of the table
let sharedTableId = "mainTableVehicle";

//defie a fn for refresh table
const buildVehicleTable = async () => {

    try {
        const vehicles = await ajaxGetReq("/vehicle/all");

        const tableColumnInfo = [

            { displayType: 'function', displayingPropertyOrFn: showVehicleType, colHeadName: 'Type' },
            { displayType: 'text', displayingPropertyOrFn: 'numberplate', colHeadName: 'Number Plate' },
            { displayType: 'text', displayingPropertyOrFn: 'vehiclename', colHeadName: 'Vehicle' },
            { displayType: 'function', displayingPropertyOrFn: showVehicleStatus, colHeadName: 'Status' }

        ];

        createTable(tableVehicleHolderDiv, sharedTableId, vehicles, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build vehicle table:", error);
    }

}

//get vehicle type 
const showVehicleTypeOri = (vehiObj) => {
    return vehiObj.vehicletype_id.name;
}

// get vehicle type
const showVehicleType = (vehiObj) => {
    const type = vehiObj.vehicletype_id.name;

    let bgColor = "#bdc3c7"; // default or non-defined types
    let text = type;

    switch (type) {
        case "Car":
            bgColor = "#f39c12";
            break;
        case "Van":
            bgColor = "#16a085";
            break;
        case "Mini Bus":
            bgColor = "#9b59b6";
            break;
        case "SUV":
            bgColor = "#34495e";
            break;
        case "Coach":
            bgColor = "#2c3e50";
            break;
    }

    return `
        <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
           style="background-color: ${bgColor}; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
           ${text}
        </p>`;
}

//get vehicle status 
const showVehicleStatus = (vehiObj) => {

    if (vehiObj.deleted_vehi == null || vehiObj.deleted_vehi == false) {
        if (vehiObj.vehi_status === "Available") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Available For Tours
                </p>`;
        }
        if (vehiObj.vehi_status === "On Tour") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #2980b9; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   On A Tour
                </p>`;
        }
        if (vehiObj.vehi_status === "Under Maintenance") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #8e44ad; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Under Maintenance
                </p>`;
        }
        if (vehiObj.vehi_status === "Not In Service") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #7f8c8d; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Not In Service
                </p>`;
        }
    } else if (vehiObj.deleted_vehi != null && vehiObj.deleted_vehi == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               ❌ Deleted Record
            </p>`;
    }

}

//fn to ready the main form for accept values
const refreshVehicleForm = async () => {

    vehicle = new Object;
    document.getElementById('formVehicle').reset();

    try {

        const vehiTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(selectVehicleType, 'Please Select The Type', vehiTypes, 'name');

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [

        'selectVehicleType',
        'inputNumberPlate',
        'inputPassengerpassengerseats',
        'inputPassengerpassengerseats',
        'selectVehicleStatus',
        'inputNote',
        'inputVehiCostPerKM',
        'inputVehiLuggageCapacity',
        'fileInputVehiPhoto',
        'dateLastService',
        'previewVehicleImg'

    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    vehicleUpdateBtn.disabled = true;
    vehicleUpdateBtn.style.cursor = "not-allowed";

    vehicleAddBtn.disabled = false;
    vehicleAddBtn.style.cursor = "pointer";
}

//cant select future days
const restrictFutureDays = () => {
    let dateInput = document.getElementById("dateLastService");

    if (dateInput) {

        let today = new Date();
        let formattedDate = today.toISOString().split('T')[0];
        dateInput.max = formattedDate;

    }
}

//to validate and bind the image 
const imgValidatorVehiclePic = (fileInputID, object, imgProperty, previewId) => {
    if (fileInputID.files != null) {
        const file = fileInputID.files[0];

        // Validate file size (1 MB max)
        const maxSizeInBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            showAlertModal('war', 'The file size exceeds 2 MB. Please select a smaller file.');
            //return false;
        }

        // Validate file type (JPEG, JPG, PNG)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            showAlertModal('war', "Invalid file type. Only JPEG, JPG, and PNG files are allowed.");
            //return false;
        }

        // Process file and update the preview
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            previewId.src = e.target.result; // Show image preview
            window[object][imgProperty] = btoa(e.target.result); // Store Base64 data
            previewId.style.border = "2px solid lime";
        };
        fileReader.readAsDataURL(file);

        //return true;
    }
    previewId.style.border = "2px solid red";
    return false;

};

//clear uploaded image (not delete)
const clearVehicleImg = () => {
    if (vehicle.vehi_photo != null) {
        let userConfirmImgDlt = confirm("Are You Sure To Clear This Image?");
        if (userConfirmImgDlt) {
            vehicle.vehi_photo = null;
            document.getElementById('previewVehicleImg').src = 'images/vehicle.png';
            document.getElementById('fileInputVehiPhoto').files = null;
            document.getElementById('previewVehicleImg').style.border = "1px solid #ced4da";

        } else {
            showAlertModal("inf", "User Cancelled The Deletion Task")
        }
    }
}

//set vehi status auto when refresh form 
//maybe hide entire thing and display only when updating ? 💥
const setVehicleStatusAuto = () => {
    document.getElementById('selectVehicleStatus').value = 'Available';
    document.getElementById('selectVehicleStatus').style.border = '2px solid lime';
    document.getElementById('selectVehicleStatus').children[2].setAttribute('class', 'd-none');
    document.getElementById('selectVehicleStatus').children[3].setAttribute('class', 'd-none');
    document.getElementById('selectVehicleStatus').children[4].setAttribute('class', 'd-none');
    vehicle.vehi_status = 'Available';
}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshVehicleForm();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

const checkVehiFormErrors = () => {

    let errors = '';

    if (vehicle.vehicletype_id == null) {
        errors = errors + "PLEASE SELECT THE VEHICLE TYPE \n"
    }

    if (vehicle.numberplate == null) {
        errors = errors + "PLEASE ENTER A VALID PLATE NUMBER \n";
    }

    if (vehicle.vehiclename == null) {
        errors = errors + "PLEASE ENTER VEHICLE MODEL \n";
    }

    if (vehicle.passengerseats == null) {
        errors = errors + "PLEASE ENTER THE MAXIMUM PASSENGER'S SEAT COUNT \n";
    }

    if (vehicle.luggage_capacity == null) {
        errors = errors + "PLEASE ENTER THE MAXIMUM LUGGAGE CAPACITY \n";
    }

    //if (vehicle.cost_per_km == null) {
    //    errors = errors + "PLEASE ENTER THE ESTIMATED COST PER KILOMETER AMOUNT \n";
    //}

    if (vehicle.vehi_status == null) {
        errors = errors + "PLEASE SELECT THE VEHICLE STATUS \n"
    }

    return errors;

}

//fn for ADD button    
const addNewVehicle = async () => {

    const errors = checkVehiFormErrors();

    if (errors == '') {
        const userResponse = confirm("Are You Sure To Add ?\n " + vehicle.vehiclename + "  (" + vehicle.numberplate + ")");

        if (userResponse) {

            try {

                const postServerResponse = await ajaxPPDRequest("/vehicle", "POST", vehicle);

                if (postServerResponse === "OK") {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formVehicle').reset();
                    refreshVehicleForm();
                    buildVehicleTable();
                    var myVehiTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myVehiTableTab.show();

                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }

            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        }
        else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('err', errors);
    }
}

//clear modal content without refreshing , to aid show new content in modal
const resetModal = () => {

    // Hide the deleted record message    
    document.getElementById('modalVehiIfDeleted').innerText = '';
    document.getElementById('modalVehiIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalVehiEditBtn').disabled = false;
    document.getElementById('modalVehiDeleteBtn').disabled = false;
    document.getElementById('modalVehiEditBtn').classList.remove('d-none');
    document.getElementById('modalVehiDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalVehiRecoverBtn').classList.add('d-none');

}

//fn for edit button
const openModal = (vehiObj) => {

    resetModal(); 

    document.getElementById('modalVehiNumberPlate').innerText = vehiObj.numberplate || 'N/A';
    document.getElementById('modalVehiModalName').innerText = vehiObj.vehiclename || 'N/A';
    document.getElementById('modalVehiPassengerSeatCount').innerText = vehiObj.passengerseats || 'N/A';
    document.getElementById('modalVehiType').innerText = vehiObj.vehicletype_id.name || 'N/A';
    document.getElementById('modalVehiStatus').innerText = vehiObj.vehi_status || 'N/A';
    document.getElementById('modalVehiLuggageCapacity').innerText = vehiObj.luggage_capacity || 'N/A';
    //document.getElementById('modalVehiCostPerKM').innerText = vehiObj.cost_per_km || 'N/A';
    document.getElementById('modalVehiLSDate').innerText = vehiObj.last_service_date || 'N/A';
    document.getElementById('modalVehiNote').innerText = vehiObj.note || 'N/A';

    if (vehiObj.vehi_photo != null) {
        document.getElementById('modalVehiPic').src = atob(vehiObj.vehi_photo)
    } else {
        document.getElementById('modalVehiPic').src = 'images/vehicle.png';
    }

    if (vehiObj.deleted_vehi) {
        document.getElementById('modalVehiIfDeleted').classList.remove('d-none');
        document.getElementById('modalVehiIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(vehiObj.deleteddatetime).toLocaleString();
        document.getElementById('modalVehiEditBtn').disabled = true;
        document.getElementById('modalVehiDeleteBtn').disabled = true;
        document.getElementById('modalVehiEditBtn').classList.add('d-none');
        document.getElementById('modalVehiDeleteBtn').classList.add('d-none');
        document.getElementById('modalVehiRecoverBtn').classList.remove('d-none');
    }

    $('#infoModalVehicle').modal('show');
}

// refill the form to edit a record
const refillVehicleForm = async (ob) => {

    vehicle = JSON.parse(JSON.stringify(ob));
    oldVehi = JSON.parse(JSON.stringify(ob));

    inputNumberPlate.value = vehicle.numberplate;
    inputVehicleName.value = vehicle.vehiclename;
    inputPassengerSeatCount.value = vehicle.passengerseats;
    inputNote.value = vehicle.note;
    inputVehiLuggageCapacity.value = vehicle.luggage_capacity;
    //inputVehiCostPerKM.value = vehicle.cost_per_km;
    dateLastService.value = vehicle.last_service_date;
    selectVehicleStatus.value = vehicle.vehi_status;

    if (vehicle.vehi_photo != null) {
        previewVehicleImg.src = atob(vehicle.vehi_photo);
    } else {
        previewVehicleImg.src = "images/vehicle.png";
    }

    try {
        vTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(selectVehicleType, 'Please Select The Type', vTypes, 'name', vehicle.vehicletype_id.name);
    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    vehicleUpdateBtn.disabled = false;
    vehicleUpdateBtn.style.cursor = "pointer";

    vehicleAddBtn.disabled = true;
    vehicleAddBtn.style.cursor = "not-allowed";

    let statusSelectElement = document.getElementById('selectVehicleStatus');
    statusSelectElement.style.border = '1px solid #ced4da';
    statusSelectElement.children[2].classList.remove('d-none');
    statusSelectElement.children[3].classList.remove('d-none');
    statusSelectElement.children[4].classList.remove('d-none');


    $("#infoModalVehicle").modal("hide");

    var myVehiFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myVehiFormTab.show();

}

const showVehicleValueChanges = () => {

    let updates = "";

    if (vehicle.vehi_photo != oldVehi.vehi_photo) {
        updates = updates + " Vehicle Photo has changed \n";
    }

    if (vehicle.vehicletype_id.name != oldVehi.vehicletype_id.name) {
        updates = updates + oldVehi.vehicletype_id.name + " will be changed to " + vehicle.vehicletype_id.name + "\n";
    }
    if (vehicle.numberplate != oldVehi.numberplate) {
        updates = updates + oldVehi.numberplate + " will be changed to " + vehicle.numberplate + "\n";
    }

    if (vehicle.vehiclename != oldVehi.vehiclename) {
        updates = updates + oldVehi.vehiclename + " will be changed to " + vehicle.vehiclename + "\n"
    }

    if (vehicle.luggage_capacity != oldVehi.luggage_capacity) {
        updates = updates + oldVehi.luggage_capacity + " will be changed to " + vehicle.luggage_capacity + "\n"
    }

    //if (vehicle.cost_per_km != oldVehi.cost_per_km) {
    //    updates = updates + oldVehi.cost_per_km + " will be changed to " + vehicle.cost_per_km + "\n"
    //}

    if (vehicle.passengerseats != oldVehi.passengerseats) {
        updates = updates + oldVehi.passengerseats + " will be changed to " + vehicle.passengerseats + "\n"
    }

    if (vehicle.vehi_status != oldVehi.vehi_status) {
        updates = updates + oldVehi.vehi_status + " will be changed to " + vehicle.vehi_status + "\n"
    }

    if (vehicle.note != oldVehi.note) {
        updates = updates + oldVehi.note + " will be changed to " + vehicle.note + "\n"
    }

    if (vehicle.last_service_date != oldVehi.last_service_date) {
        updates = updates + oldVehi.last_service_date + " will be changed to " + vehicle.last_service_date + "\n"
    }
   
    return updates;
}

//fn for UPDATE btn
const updateVehicle = async () => {

    //check errors
    let errors = checkVehiFormErrors();
    if (errors == '') {

        //check updates
        let updates = showVehicleValueChanges();
        if (updates == '') {
            showAlertModal('err', 'No Changes Detected');
        } else {
            let userResponse = confirm("Are You Sure To Proceed? \n \n " + updates);

            if (userResponse) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/vehicle", "PUT", vehicle);
                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', "Successfully Updted");
                        document.getElementById('formVehicle').reset();
                        refreshVehicleForm();
                        buildVehicleTable();
                        var myVehiTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myVehiTableTab.show();
                    } else {
                        showAlertModal('err', "Update Failed \n" + putServiceResponse);
                    }
                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                showAlertModal('inf', "User cancelled the task");
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}

//fn for delete button
const deleteVehicleRecord = async (ob) => {

    const userResponse = confirm('Are You Sure To Delete ?');

    if (userResponse) {

        try {
            let deleteServerResponse = await ajaxPPDRequest("/vehicle", "DELETE", ob);

            if (deleteServerResponse == 'OK') {
                showAlertModal('suc', 'Record Deleted');
                $('#infoModalVehicle').modal('hide');
                buildVehicleTable();
            } else {
                showAlertModal('err', "Delete Failed \n" + deleteServerResponse);
            }
        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', "User cancelled the task");
    }
}

const restoreVehicleRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥💥
            vehicle = window.currentObject;
            vehicle.deleted_vehi = false;

            let putServiceResponse = await ajaxPPDRequest("/vehicle", "PUT", vehicle);

            if (putServiceResponse === "OK") {
                showAlertModal('suc', "Successfully Restored");
                document.getElementById('formVehicle').reset();
                $("#infoModalVehicle").modal("hide");
                window.location.reload();

            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'User cancelled the recovery task');
    }


}

//fn for print btn
const printVehicleRecord = () => {
    console.log("print button clicked");
}
