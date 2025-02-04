window.addEventListener('load', () => {

    loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/VEHICLE");

    refreshVehiTable();

    refreshVehiForm();

    refreshVehiTypeForm();

})

//defie a fn for refresh table
const refreshVehiTable = () => {

    vehicles = [];
    $.ajax("vehicle/alldata", {
        type: "GET",
        contentType: "json",
        async: false,

        success: function (data) {
            console.log("success");
            vehicles = data;
        },

        error: function (resOb) {
            console.log("failed");
            vehicles = [];
        }
    });

    const displayProperty = [

        { displayType: 'function', displayingPropertyOrFn: showDesignation, colHeadName: 'Type' },
        { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Number Plate' },
        { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Vehicle' },      
        { displayType: 'function', displayingPropertyOrFn: showVehicleStatus, colHeadName: 'Status' }

    ];

    fillDataIntoTable3(tableVehicle, vehicles, displayProperty, true, loggedUserPrivileges)

    //call the new datatable format(from net)
    $('#tableVehicle').dataTable();
}



//apply changes depend on Vehicle source 
const changesBasedOnVehiSource = () => {
    if (companyOwnVehicle.checked) {

        vehicle.iscompanyown = true;

        vehiAgencyName.disabled = true;
        vehiAgencyContact.disabled = true;

        vehicle.agencyname = null;
        vehiAgencyName.value = '';
        vehiAgencyName.style.border = "1px solid #ced4da";

        vehicle.agencycontactnum = null;
        vehiAgencyContact.value = '';
        vehiAgencyContact.style.border = "1px solid #ced4da";
    }
    if (externalVehicle.checked) {

        vehicle.iscompanyown = false;

        vehiAgencyName.disabled = false;
        vehiAgencyContact.disabled = false;
    }

}

//to refresh form
const refreshVehiForm = () => {

    vehicle = new Object;

    formVehicle.reset();

    vTypes = ajaxGetRequest("/vtypes/alldata");
    fillDataIntoSelect(selectType, 'Please Select The Type', vTypes, 'name')

    vStatus = ajaxGetRequest("/vstatus/alldata");
    fillDataIntoSelect(selectStatus, 'Please Select The Status', vStatus, 'name')

    selectType.style.border = "1px solid #ced4da";
    textLicNo.style.border = "1px solid #ced4da";
    textManuf.style.border = "1px solid #ced4da";
    textModal.style.border = "1px solid #ced4da";
    // intYear.style.border = "1px solid #ced4da";
    intSeatCount.style.border = "1px solid #ced4da";
    selectStatus.style.border = "1px solid #ced4da";
    inputNote.style.border = "1px solid #ced4da";
    vehiAgencyName.style.border = "1px solid #ced4da";
    vehiAgencyContact.style.border = "1px solid #ced4da";

    vehicleUpdateBtn.disabled = true;
    vehicleUpdateBtn.style.cursor = "not-allowed";
}

//to combine values and get full name
const createVFullName = (ob) => {
    return ob.manufacturer + " " + ob.modal;
}

//get vehicle type from dynamic select table
const getVType = (ob) => {
    return ob.vehitype_id.name;
}
//get vehicle status from dynamic select table
const getVStatus = (ob) => {

    if (ob.vehistatus_id.name == 'Available For Service') {
        return "<p class = 'status-available'>" + ob.vehistatus_id.name + "</p>";
    }
    if (ob.vehistatus_id.name == 'In Action') {
        return "<p class = 'status-action'>" + ob.vehistatus_id.name + "</p>";
    }
    if (ob.vehistatus_id.name == 'Under Maintenance') {
        return "<p class = 'status-maintenance'>" + ob.vehistatus_id.name + "</p>";
    }
    if (ob.vehistatus_id.name == 'Out Of Service') {
        return "<p class = 'status-out'>" + ob.vehistatus_id.name + "</p>";
    }

}

//fn for UPDATE btn
const btnUpdateVehi = () => {
    //check errors
    let errors = checkFormErrors();
    if (errors == '') {

        //check updates
        let updates = getVehiFormUpdates();
        if (updates == '') {
            alert('No Changes Detected');
        } else {
            let userResponse = confirm("Are You Sure To Update Following Changes? \n \n " + updates);

            if (userResponse) {
                let putServiceResponce = ajaxRequest("/vehicle", "PUT", vehicle);
                if (putServiceResponce == "OK") {
                    alert("Successfully Updted");
                    $('#canvasVehi').modal('hide');
                    formVehicle.reset();
                    refreshVehiForm();
                    refreshVehiTable();
                } else {
                    alert("An Error Occured " + putServiceResponce);

                }
            } else {
                alert("Operation Cancelled By User")
            }
        }

    } else {
        alert('There Is An Unfilled Field  \n ' + errors);
    }
}

const getVehiFormUpdates = () => {

    let updates = "";

    if (vehicle.vehitype_id.name != oldVehi.vehitype_id.name) {
        updates = updates + oldVehi.vehitype_id.name + " will be changed to " + vehicle.vehitype_id.name + "\n";
    }
    if (vehicle.licencenumber != oldVehi.licencenumber) {
        updates = updates + oldVehi.licencenumber + " will be changed to " + vehicle.licencenumber + "\n";
    }

    if (vehicle.manufacturer != oldVehi.manufacturer) {
        updates = updates + oldVehi.manufacturer + " will be changed to " + vehicle.manufacturer + "\n"
    }

    if (vehicle.modal != oldVehi.modal) {
        updates = updates + oldVehi.modal + " will be changed to " + vehicle.modal + "\n"
    }

    // if (vehicle.year != oldVehi.year) {
    //     updates = updates + oldVehi.year + " will be changed to " + vehicle.year + "\n"
    // }

    if (vehicle.seatcount != oldVehi.seatcount) {
        updates = updates + oldVehi.seatcount + " will be changed to " + vehicle.seatcount + "\n"
    }

    if (vehicle.vehistatus_id.name != oldVehi.vehistatus_id.name) {
        updates = updates + oldVehi.vehistatus_id.name + " will be changed to " + vehicle.vehistatus_id.name + "\n"
    }

    if (vehicle.discription != oldVehi.discription) {
        updates = updates + oldVehi.discription + " will be changed to " + vehicle.discription + "\n"
    }

    return updates;
}

//fn for ADD button    //value ekak type karala delete kalath e value eka add wenawa table ekata????? 
const btnAddVehi = () => {

    const errors = checkFormErrors();

    if (errors == '') {
        const userResponse = confirm("Are You Sure To Add ?\n " + vehicle.licencenumber);

        if (userResponse) {
            //call post service
            let postServiceResponse;

            //call ajax post
            $.ajax("/vehicle", {
                type: "POST",
                data: JSON.stringify(vehicle),
                contentType: "application/json",
                async: false,

                success: function (data) {
                    console.log("success " + data);
                    postServiceResponse = data;
                },

                error: function (resOb) {
                    console.log("failed " + resOb);
                    postServiceResponse = resOb;
                }
            });

            if (postServiceResponse == "OK") {
                console.log("add btn working fine");
                alert("saved !!!");
                formVehicle.reset();
                refreshVehiForm();
                refreshVehiTable();
                // canvasVehiClose.click();
                $('#canvasVehi').modal('hide');

            } else {
                alert("Post Service Failed \n " + postServiceResponse)
            }
        }
        else {
            alert("Operator Cancelled The Task")
        }
    } else {
        alert('Form Has Following Errors \n \n' + errors)
    }


}

const checkFormErrors = () => {

    let errors = '';

    if (vehicle.vehitype_id == null) {
        errors = errors + "PLEASE SELECT THE VEHICLE TYPE \n"
    }

    if (vehicle.licencenumber == null) {
        errors = errors + "PLEASE ENTER A VALID LICENCE NUMBER \n";
    }

    if (vehicle.manufacturer == null) {
        errors = errors + "PLEASE ENTER MANUFACTURER'S NAME \n";
    }

    if (vehicle.modal == null) {
        errors = errors + "PLEASE ENTER MODAL NAME \n";
    }

    // if (vehicle.year == null) {
    //     errors = errors + "PLEASE ENTER YEAR MADE \n";
    // }

    if (vehicle.seatcount == null) {
        errors = errors + "PLEASE ENTER THE SEAT COUNT \n";
    }

    if (vehicle.vehistatus_id == null) {
        errors = errors + "PLEASE SELECT THE VEHICLE STATUS \n"
    }

    return errors;

}

//fn for EDIT btn
const vehiFormRefill = (ob) => {

    vehicle = JSON.parse(JSON.stringify(ob));
    oldVehi = JSON.parse(JSON.stringify(ob));

    $('#canvasVehi').modal('show');

    addNewTypeBtn.disabled = true;

    textLicNo.value = vehicle.licencenumber;
    textManuf.value = vehicle.manufacturer;
    textModal.value = vehicle.modal;
    // intYear.value = vehicle.year;
    intSeatCount.value = vehicle.seatcount;
    inputNote.value = vehicle.discription;

    vTypes = ajaxGetRequest("/vtypes/alldata");
    fillDataIntoSelect(selectType, 'Please Select The Type', vTypes, 'name', vehicle.vehitype_id.name)

    vStatus = ajaxGetRequest("/vstatus/alldata");
    fillDataIntoSelect(selectStatus, 'Please Select The Status', vStatus, 'name', vehicle.vehistatus_id.name)

    vehicleUpdateBtn.disabled = false;
    vehicleUpdateBtn.style.cursor = "pointer";

    vehicleAddBtn.disabled = true;
    vehicleAddBtn.style.cursor = "not-allowed";


}

//fn for delete button
const deleteVehiRow = (ob, row) => {
    console.log("delete button clicked");

    tableVehicle.children[1].children[row].style.backgroundColor = 'red';
    // not working??? tableVehicle.children[1].children[row].style.color = 'white';

    setTimeout(function () {

        const userResponse = confirm('Are You Sure To Delete ?');

        if (userResponse) {
            let deleteServerResponse = ajaxRequest("/vehicle", "DELETE", ob);

            if (deleteServerResponse == 'OK') {
                alert("Delete success")
                refreshVehiTable();
            } else {
                alert("Delete Failed \n" + deleteServerResponse);
            }

        } else {
            alert("Operator Cancelled The Deletion")
        }
    }, 500);

}

//fn for print btn
const printVehiData = () => {
    console.log("print button clicked");
}

//for add new elements
const refreshVehiTypeForm = () => {

    vehitypeobj = new Object();
    newVehiTypeName.value = "";
    newVehiTypeName.style.border = "2px solid #ced4da"

    newChargePKM.value = "";
    newChargePKM.style.border = "2px solid #ced4da"
}

//to edit type related info
const refillCollapse = (ob) => {
    // vehitypeobj = JSON.parse(JSON.stringify(ob));
    // vehitypeOldObj = JSON.parse(JSON.stringify(ob));

    vehitypeobj.id = vehicle.vehitype_id.id;

    newVehiTypeName.value = vehicle.vehitype_id.name;
    vehitypeobj.name = newVehiTypeName.value;

    newChargePKM.value = vehicle.vehitype_id.chargeperkm;
    vehitypeobj.chargeperkm = newChargePKM.value;

    vehitypeAddBtn.disabled = false;

    collapseExample.classList.add('show');
}

//add a new vehicle type into select element
const submitNew = () => {
    if (vehitypeobj.name != null && vehitypeobj.chargeperkm != null) {
        let userConfirm = confirm('Are You Sure To Add ?');
        if (userConfirm) {
            let postServiceResponse = ajaxRequest("/vtypes", "POST", vehitypeobj);
            if (postServiceResponse == "OK") {
                alert('saved');
                vTypes = ajaxGetRequest("/vtypes/alldata");
                fillDataIntoSelect(selectType, 'Please Select The Type', vTypes, 'name', newVehiTypeName.value)
                vehicle.vehitype_id = JSON.parse(selectType.value);

                chargePKM.value = vehitypeobj.chargeperkm;

                refreshVehiTypeForm();
                collapseExample.classList.remove('show');


            } else {
                alert("An Error Occured \n " + postServiceResponse);
            }
        } else {
            alert('Operation cancelled by the user')
        }
    } else {
        alert("Please Fill All The Fields")
    }
}

const getVehiTypeFormUpdates = () => {

    let updates = "";

    if (vehitypeobj.name != vehitypeOldObj.name) {
        updates = updates + " Vehicle Type Name Changed  \n";
    }

    if (vehitypeobj.chargeperkm != vehitypeOldObj.chargeperkm) {
        updates = updates + " Charge Per KiloMeter Changed \n";
    }

    return updates;

}

//update button inside collapse
const updateVehiType = () => {
    //check errors
    if (vehitypeobj.name != null && vehitypeobj.chargeperkm != null) {
        {
            let userResponse = confirm("Are You Sure To Update ?");

            if (userResponse) {
                let putServiceResponce = ajaxRequest("/vehitypeupdate", "PUT", vehitypeobj);
                if (putServiceResponce == "OK") {
                    alert("Successfully Updted");
                    refreshVehiTypeForm();
                    collapseExample.classList.remove('show');
                } else {
                    alert("An Error Occured " + putServiceResponce);

                }
            } else {
                alert("Operation Cancelled By User")
            }
        }
    } else {
        alert('There Is An Unfilled Field');
    }
}

//pass the cpkm whena vehicle type is selected
const passCPKM = () => {
    let selectedVehicle = JSON.parse(selectType.value);
    chargePKM.value = selectedVehicle.chargeperkm;

}
