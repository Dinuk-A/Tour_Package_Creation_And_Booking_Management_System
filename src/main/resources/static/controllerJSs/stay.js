window.addEventListener('load', () => {

    //loggedUserPrivileges = await ajaxGetReq("/privilege/bymodule/STAY");

    buildStayTable();

    refreshStayForm();
});

//global var to store id of the table
let sharedTableId = "mainTableStay";

//fn for create and show data in table
const buildStayTable = async () => {

    try {
        const stays = await await ajaxGetReq("/stay/all");

        const tableColumnInfo =

            [

                { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Name' },
                //{ displayType: 'text', displayingPropertyOrFn: showStayType, colHeadName: 'Type' },
                { displayType: 'function', displayingPropertyOrFn: showDistNProvince, colHeadName: 'District' },
                { displayType: 'function', displayingPropertyOrFn: showStayContacts, colHeadName: 'Contacts' },
                { displayType: 'function', displayingPropertyOrFn: showStayStatus, colHeadName: 'Status' }

            ]

        createTable(tableStayHolderDiv, sharedTableId, stays, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build Stay table:", error);
    }

}

//fn for show district + province in table
const showDistNProvince = (ob) => {
    return ob.district_id.name + " <br/> " + ob.district_id.province_id.name + " Province";
}

const showStayType = () => {
    //💥💥💥
}

const showStayContacts = (ob) => {
    return ob.contactnumone + "<br/>" + ob.email;
}

const showStayStatus = (ob) => {
    if (ob.deleted_stay == null || ob.deleted_stay == false) {
        if (ob.stay_status === "open") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Open
                </p>`;
        } else if (ob.stay_status === "temporary_closed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Temporarily Closed
                </p>`;
        } else if (ob.stay_status === "permanantly_closed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Permanently Closed
                </p>`;
        }
    } else if (ob.deleted_stay != null && ob.deleted_stay === true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
};

const refreshStayForm = async () => {

    stay = new Object();

    document.getElementById('formStay').reset();

    try {
        //get stay types
        stayTypes = await ajaxGetReq("/staytype/all");
        fillDataIntoDynamicSelects(selectStayType, 'Please Select The Type', stayTypes, 'name');

        //get province list
        provinces = await ajaxGetReq("province/all");
        fillDataIntoDynamicSelects(selectStayProvince, 'Please Select The Province', provinces, 'name');

        //get district list 
        districts = await ajaxGetReq("district/all");
        fillDataIntoDynamicSelects(selectStayDistrict, 'Please Select The Provice First', districts, 'name');
        selectStayDistrict.disabled = true;

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputStayName',
        'selectStayType',
        'inputStayAddress',
        'selectStayProvince',
        'selectStayDistrict',
        'inputStayContactOne',
        'inputStayContactTwo',
        'inputStayEmail',
        'selectStayStatus',
        'inputStayNote',
        'inputGeoCoords'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    //stayMaxGuestCount.style.border = "1px solid #ced4da" 💥💥;

    stayUpdateBtn.disabled = true;
    stayUpdateBtn.style.cursor = "not-allowed";

    stayAddBtn.disabled = false;
    stayAddBtn.style.cursor = "pointer";

}

const setStayStatusAuto = () => {
    document.getElementById('selectStayStatus').value = 'open';
    document.getElementById('selectStayStatus').style.border = '2px solid lime';
    document.getElementById('selectStayStatus').children[4].setAttribute('class', 'd-none');
    stay.stay_status = 'open';
}

const checkStayFormErrors = () => {
    let errors = '';

    if (stay.name == null) {
        errors = errors + " Please Enter The Accomodation's Name \n";
    }

    if (stay.district_id == null) {
        errors = errors + " Please Select The District \n";
    }

    if (stay.gcoords == null) {
        errors = errors + " Please Enter The Accomodation's Geo Coords \n";
    }

    //if (stay.stay_type_id == null) {
    //    errors = errors + " Please Select The Stay Type \n";
    //}


    if (stay.contactnumone == null) {
        errors = errors + " Please Enter A Contact Number \n";
    }

    if (stay.email == null) {
        errors = errors + " Please Enter The Email \n";
    }

    //if (stay.maxguestscount == null) {
    //    errors = errors + " Please Enter The Guest Count \n";
    //}


    return errors;
}

const addNewStay = async () => {

    //check errors
    const errors = checkStayFormErrors();

    if (errors == '') {
        const userConfirm = confirm('Are You Sure To Add ? \n' + stay.name)

        if (userConfirm) {

            try {
                //call POST service
                let postServiceResponse = await ajaxPPDRequest("/stay", "POST", stay);

                if (postServiceResponse === "OK") {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formStay').reset();
                    refreshStayForm();
                    buildStayTable();
                    var myStayTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myStayTableTab.show();

                } else {
                    showAlertModal('err', 'Submit Failed ' + postServiceResponse);
                }
            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }


        } else {
            //💥💥💥
            showAlertModal('inf', 'Operation Cancelled By User')
        }
    } else {
        showAlertModal('err', errors);
    }

}

//clear modal content without refreshing , to aid show new content in modal
const resetModal = () => {

    // Hide the deleted record message    
    document.getElementById('modalStayIfDeleted').innerText = '';
    document.getElementById('modalStayIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalStayEditBtn').disabled = false;
    document.getElementById('modalStayDeleteBtn').disabled = false;
    document.getElementById('modalStayEditBtn').classList.remove('d-none');
    document.getElementById('modalStayDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalStayRecoverBtn').classList.add('d-none');

}

//fn for edit button
const openModal = (stayObj) => {

    resetModal();

    // Modal Data Population
    document.getElementById('modalStayName').innerText = stayObj.name || 'N/A';
    document.getElementById('modalStayType').innerText = stayObj.stay_type_id.name || 'N/A';
    document.getElementById('modalStayDistrict').innerText = stayObj.district_id.name || 'N/A';
    document.getElementById('modalStayProvince').innerText = stayObj.district_id.province_id.name || 'N/A';
    document.getElementById('modalStayGeoCoords').innerText = stayObj.gcoords || 'N/A';
    document.getElementById('modalStayAddress').innerText = stayObj.address || 'N/A';
    document.getElementById('modalStayContact1').innerText = stayObj.contactnumone || 'N/A';
    document.getElementById('modalStayContact2').innerText = stayObj.contactnumtwo || 'N/A';
    document.getElementById('modalStayEmail').innerText = stayObj.email || 'N/A';
    document.getElementById('modalStayStatus').innerText = stayObj.stay_status || 'N/A';
    document.getElementById('modalStayAdditionalDetails').innerText = stayObj.note || 'N/A';

    // Handle Deleted Stay
    if (stayObj.deleted_stay) {
        document.getElementById('modalStayIfDeleted').classList.remove('d-none');
        document.getElementById('modalStayIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(stayObj.deleteddatetime).toLocaleString();
        document.getElementById('modalStayEditBtn').disabled = true;
        document.getElementById('modalStayDeleteBtn').disabled = true;
        document.getElementById('modalStayEditBtn').classList.add('d-none');
        document.getElementById('modalStayDeleteBtn').classList.add('d-none');
        document.getElementById('modalStayRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalStay').modal('show');
};

//fn for restore button
const restoreStayRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            stay = window.currentObject;
            stay.deleted_stay = false;

            let putServiceResponse = await ajaxPPDRequest("/stay", "PUT", stay);

            if (putServiceResponse === "OK") {
                showAlertModal('suc', "Successfully Restored");
                document.getElementById('formStay').reset();
                $("#infoModalStay").modal("hide");
                window.location.reload();

            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'Recovery process has cancelled');
    }
}

const refillStayForm = async (ob) => {

    stay = JSON.parse(JSON.stringify(ob));
    stayOldObj = JSON.parse(JSON.stringify(ob));

    selectStayDistrict.disabled = false;

    inputStayName.value = stay.name;
    selectStayType.value = stay.stay_type_id;
    inputStayAddress.value = stay.address;
    inputStayContactOne.value = stay.contactnumone;
    inputStayContactTwo.value = stay.contactnumtwo;
    inputStayEmail.value = stay.email;
    inputStayNote.value = stay.note;
    inputGeoCoords.value = stay.gcoords;
    //stayMaxGuestCount.value = stay.maxguestscount 💥💥

    try {

        //get stay types
        stayTypes = await ajaxGetReq("/staytype/all");
        fillDataIntoDynamicSelects(selectStayType, 'Please Select The Type', stayTypes, 'name', stay.stay_type_id.name);

        provinces = await ajaxGetReq("/province/all");
        fillDataIntoDynamicSelects(selectStayProvince, 'Please Select The Province', provinces, 'name', stay.district_id.province_id.name)
        selectStayProvince.style.border = "1px solid ced4da";

        districts = await ajaxGetReq("/district/all");
        fillDataIntoDynamicSelects(selectStayDistrict, 'Please Select The District', districts, 'name', stay.district_id.name);

    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }

    stayAddBtn.disabled = true;
    stayAddBtn.style.cursor = "not-allowed";

    stayUpdateBtn.disabled = false;
    stayUpdateBtn.style.cursor = "pointer";

    $("#infoModalStay").modal("hide");

    var myStayFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myStayFormTab.show();
}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshStayForm();
        }
    });
});

const showStayValueChanges = () => {

    let updates = "";

    if (stay.name != stayOldObj.name) {
        updates = updates + "Name will be changed to " + stay.name + "\n";
    }

    if (stay.gcoords != stayOldObj.gcoords) {
        updates = updates + "Geo Coords will be changed to " + stay.gcoords + "\n";
    }

    if (stay.address != stayOldObj.address) {
        updates = updates + "Address will be changed to " + stay.address + "\n";
    }

    if (stay.stay_status != stayOldObj.stay_status) {
        updates = updates + " Status will be changed to " + stay.stay_status + "\n";
    }

    if (stay.contactnumone != stayOldObj.contactnumone) {
        updates = updates + "Contact Number #1 will be changed to " + stay.contactnumone + "\n";
    }

    if (stay.contactnumtwo != stayOldObj.contactnumtwo) {
        updates = updates + "Contact Number #2 will be changed to " + stay.contactnumtwo + "\n";
    }

    if (stay.email != stayOldObj.email) {
        updates = updates + "Email will be changed to " + stay.email + "\n";
    }
    //
    //    if (stay.maxguestscount != stayOldObj.maxguestscount) {
    //        updates = updates + "Max guests count will be changed to " + stay.maxguestscount + "\n";
    //    }

    if (stay.note != stayOldObj.note) {
        updates = updates + "Note will be changed to " + stay.note + "\n";
    }

    if (stay.district_id.name != stayOldObj.district_id.name) {
        updates = updates + "District will be changed to " + stay.district_id.name + "\n";
    }



    //if (stay.stay_type_id.name != stayOldObj.stay_type_id.name) {
    //    updates = updates + "Stay type will be changed to " + stay.stay_type_id.name + "\n";
    //}

    return updates

}

//fn for update BTN
const updateStay = async () => {

    let errors = checkStayFormErrors();
    if (errors == "") {
        let updates = showStayValueChanges();
        if (updates == "") {
            showAlertModal('err', "No changes detected");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponce = await ajaxPPDRequest("/stay", "PUT", stay);

                    if (putServiceResponce == "OK") {
                        showAlertModal('suc', "Successfully Updted");
                        document.getElementById('formStay').reset();
                        refreshStayForm();
                        buildStayTable();
                        var myStayTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myStayTableTab.show();

                    } else {
                        showAlertModal('err', "An Error Occured " + putServiceResponce);
                    }
                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }

            } else {
                showAlertModal('inf', "Operation cancelled by the Operator");
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}

//for delete btn
const deleteStayRecord = async (ob) => {

    const userConfirm = confirm('Are you sure to delete the record ? ' + ob.name + ' ?');

    if (userConfirm) {

        try {
            let deleteServerResponse = await ajaxPPDRequest("/stay", "DELETE", ob);
            if (deleteServerResponse === "OK") {
                showAlertModal('suc', 'Deleted succesfully');
                $('#infoModalStay').modal('hide');
                window.location.reload();
            } else {
                showAlertModal('err', "Delete Failed \n" + deleteServerResponse);
            }
        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }

    } else {
        showAlertModal('inf', "User cancelled the task")
    }
}

//get district list based on selected province
const getDistByProvince = async () => {

    const currentProvinceID = JSON.parse(selectStayProvince.value).id;
    selectStayProvince.style.border = '2px solid lime';
    selectStayDistrict.disabled = false;

    try {
        const districts = await ajaxGetReq("districts/byprovinceid/" + currentProvinceID);
        fillDataIntoDynamicSelects(selectStayDistrict, " Please Select The District Now", districts, 'name');
    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }


}
