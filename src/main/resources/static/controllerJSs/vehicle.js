window.addEventListener('load', () => {

    buildVehicleTable();
    refreshVehicleForm();

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
const showVehicleType = (vehiObj) => {
    return vehiObj.vehicletype_id.name;
}

//get vehicle status 
const showVehicleStatus = (vehiObj) => {

    if (vehiObj.deleted_vehi == null || vehiObj.deleted_vehi == false) {
        if (vehiObj.vehi_status === "Available") {
            return "<p class='bg-success text-white my-0'> Available For Tours </p>";
        }
        if (vehiObj.vehi_status === "On Tour") {
            return "On A Tour";
        }
        if (vehiObj.vehi_status === "Under Maintenance") {
            return "Under Maintenance";
        }
        if (vehiObj.vehi_status === "Not In Service") {
            return "Not In Service";
        }
    } else if (vehiObj.deleted_vehi != null && vehiObj.deleted_vehi == true) {
        return '<p class="text-white bg-danger p-1"> Deleted Record </p>'
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

    if (vehicle.vehi_status == null) {
        errors = errors + "PLEASE SELECT THE VEHICLE STATUS \n"
    }

    return errors;

}

//fn for ADD button    
const addNewVehicle = async () => {

    const errors = checkVehiFormErrors();

    if (errors == '') {
        const userResponse = confirm("Are You Sure To Add ?\n " + vehicle.numberplate);

        if (userResponse) {

            try {

                const postServerResponse = await ajaxPPDRequest("/vehicle", "POST", vehicle);

                if (postServerResponse === "OK") {
                    showAlertModal('suc','Saved Successfully');
                    document.getElementById('formVehicle').reset();
                    refreshVehicleForm();
                    buildVehicleTable();
                    var myVehiTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myVehiTableTab.show();

                } else {
                    showAlertModal('err','Submit Failed ' + postServerResponse);
                }

            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        }
        else {
            showAlertModal('inf','User cancelled the task');
        }
    } else {
        showAlertModal('err', errors);
    }


}

//fn for edit button, 💥
const openModal = (vehiObj) => {
    document.getElementById('modalVehiNumberPlate').innerText = vehiObj.numberplate || 'N/A';
    document.getElementById('modalVehiModalName').innerText = vehiObj.vehiclename || 'N/A';
    document.getElementById('modalVehiPassengerSeatCount').innerText = vehiObj.passengerseats || 'N/A';
    document.getElementById('modalVehiType').innerText = vehiObj.vehicletype_id.name || 'N/A';
    document.getElementById('modalVehiStatus').innerText = vehiObj.vehi_status || 'N/A';
    document.getElementById('modalVehiNote').innerText = vehiObj.note || 'N/A';

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

    document.getElementById('selectVehicleStatus').style.border = '1px solid #ced4da';
    document.getElementById('selectVehicleStatus').children[2].classList.remove('d-none');
    document.getElementById('selectVehicleStatus').children[3].classList.remove('d-none');
    document.getElementById('selectVehicleStatus').children[4].classList.remove('d-none');


    $("#infoModalVehicle").modal("hide");

    var myVehiFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myVehiFormTab.show();

}

const showVehicleValueChanges = () => {

    let updates = "";

    if (vehicle.vehicletype_id.name != oldVehi.vehicletype_id.name) {
        updates = updates + oldVehi.vehicletype_id.name + " will be changed to " + vehicle.vehicletype_id.name + "\n";
    }
    if (vehicle.numberplate != oldVehi.numberplate) {
        updates = updates + oldVehi.numberplate + " will be changed to " + vehicle.numberplate + "\n";
    }

    if (vehicle.vehiclename != oldVehi.vehiclename) {
        updates = updates + oldVehi.vehiclename + " will be changed to " + vehicle.vehiclename + "\n"
    }

    if (vehicle.passengerseats != oldVehi.passengerseats) {
        updates = updates + oldVehi.passengerseats + " will be changed to " + vehicle.passengerseats + "\n"
    }

    if (vehicle.vehi_status != oldVehi.vehi_status) {
        updates = updates + oldVehi.vehi_status + " will be changed to " + vehicle.vehi_status + "\n"
    }

    if (vehicle.note != oldVehi.note) {
        updates = updates + oldVehi.note + " will be changed to " + vehicle.note + "\n"
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
            showAlertModal('err','No Changes Detected');
        } else {
            let userResponse = confirm("Are You Sure To Proceed? \n \n " + updates);

            if (userResponse) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/vehicle", "PUT", vehicle);
                    if (putServiceResponse === "OK") {
                        showAlertModal('suc',"Successfully Updted");
                        document.getElementById('formVehicle').reset();
                        refreshVehicleForm();
                        buildVehicleTable();
                        var myVehiTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myVehiTableTab.show();
                    } else {
                        showAlertModal('err',"Update Failed \n" + putServiceResponse);
                    }
                } catch (error) {
                    showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                showAlertModal('inf',"User cancelled the task");
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
                showAlertModal('suc','Record Deleted');
                $('#infoModalVehicle').modal('hide');
                buildVehicleTable();
            } else {
                showAlertModal('err',"Delete Failed \n" + deleteServerResponse);
            }
        } catch (error) {
            showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf',"User cancelled the task");
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
                showAlertModal('suc',"Successfully Restored");
                document.getElementById('formVehicle').reset();
                $("#infoModalVehicle").modal("hide");
                window.location.reload();

            } else {
                showAlertModal('err',"Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf','User cancelled the recovery task');
    }


}

//fn for print btn
const printVehicleRecord = () => {
    console.log("print button clicked");
}
