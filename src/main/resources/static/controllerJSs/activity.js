window.addEventListener('load', () => {

    buildActivityTable();
    refreshActivityForm();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//global var to store id of the table
let sharedTableId = "mainTableActivity";

//to create and refresh content in main activity table
const buildActivityTable = async () => {

    try {
        const activities = await ajaxGetReq("/activity/all");

        const tableColumnInfo = [

            { displayType: 'text', displayingPropertyOrFn: 'act_name', colHeadName: 'Activity' },

            { displayType: 'function', displayingPropertyOrFn: showActType, colHeadName: 'Categories' },

            { displayType: 'function', displayingPropertyOrFn: showDistrict, colHeadName: 'District' },

            { displayType: 'function', displayingPropertyOrFn: showContacts, colHeadName: 'Contacts' },

            { displayType: 'function', displayingPropertyOrFn: showStatus, colHeadName: 'Status' }

        ]

        createTable(tableActivityHolderDiv, sharedTableId, activities, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build activity table:", error);
    }

}

//
const showActType = (actObj) => {
    return actObj.act_type_id.name;
}

//
const showDistrict = (actObj) => {
    return actObj.district_id.name;
}

//
const showContacts = (actObj) => {
    return actObj.contactone + '<br>' + actObj.act_email;
}

//
const showStatus = (actObj) => {

    if (actObj.deleted_act == null || actObj.deleted_act == false) {
        if (actObj.act_status == "available") {
            return "Available"
        } else if (actObj.act_status == "permanantly_closed") {
            return "Permanantly Closed"
        }
        else if (actObj.act_status == "temporary_closed") {
            return "Temporary Closed"
        }
    } else if (actObj.deleted_act != null && actObj.deleted_act == true) {
        return '<p class="text-white bg-danger text-center my-0 p-2" > Deleted Record </p>'
    }
}

const refreshActivityForm = async () => {

    activity = new Object();

    document.getElementById('formActivity').reset();

    try {

        const provinces = await ajaxGetReq("/province/all");
        fillDataIntoDynamicSelects(selectActivityProvince, 'Please Select The Province', provinces, 'name');

        const act_types = await ajaxGetReq("/acttype/all");
        fillDataIntoDynamicSelects(selectActivityType, 'Please Select Activity Type', act_types, 'name');


    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputActivityName',
        'selectActivityType',
        'inputShortDescription',
        'inputProviderName',
        'selectActivityProvince',
        'selectActivityDistrict',
        'inputActivityLocation',
        'inputActivityEmail',
        'inputContact1',
        'inputContact2',
        'inputActivityDuration',
        'inputAdultPrice',
        'inputChildPrice',
        'inputAdditionalInfo',
        'selectActivityStatus'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    activityUpdateBtn.disabled = true;
    activityUpdateBtn.style.cursor = "not-allowed";

    activityAddBtn.disabled = false;
    activityAddBtn.style.cursor = "pointer";

}

//set the status as auto every time when a new form is opened
const setActivityStatusAuto = () => {
    document.getElementById('selectActivityStatus').value = 'available';
    document.getElementById('selectActivityStatus').style.border = '2px solid lime';
    document.getElementById('selectActivityStatus').children[4].setAttribute('class', 'd-none');
    activity.act_status = 'available';
}

//check errors before submitting
const checkActFormErrors = () => {
    let errors = "";

    if (activity.act_name == null) {
        errors += "Activity Name cannot be empty \n";
    }

    if (activity.description == null) {
        errors += "Description cannot be empty \n";
    }

    if (activity.act_provider == null) {
        errors += "Activity Provider Name cannot be empty \n";
    }

    if (activity.contactone == null) {
        errors += "contact one cannot be empty \n";
    }

    if (activity.location == null) {
        errors += "Address cannot be empty \n";
    }

    if (activity.price_adult == null) {
        errors += "Price for adults cannot be empty \n";
    }

    if (activity.price_child == null) {
        errors += "Price for children cannot be empty \n";
    }

    if (activity.act_status == null) {
        errors += "Status cannot be empty \n";
    }

    if (activity.district_id == null) {
        errors += "District cannot be empty \n";
    }

    if (activity.act_type_id == null) {
        errors += "Activity Type cannot be empty \n";
    }

    return errors;
};

//check if num1 and 2 are same
const checkDuplicatedNumbers = (thisInput, otherInput, attributeName) => {
    if (thisInput.value == otherInput.value) {
        alert("both numbers cant be same");
    } else {
        inputValidatorText(thisInput, '^[0][0-9]{9}$', 'activity', attributeName)
    }
}

//fn to submit button (add button)
const addNewActivity = async () => {
    const errors = checkActFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/activity", "POST", activity);

                if (postServerResponse === 'OK') {
                    alert('Saved Successfully');
                    document.getElementById('formActivity').reset();
                    refreshActivityForm();
                    buildActivityTable();
                    var myActTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myActTableTab.show();
                } else {
                    alert('Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                // Handle errors (such as network issues or server errors)
                alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            alert('User cancelled the task');
        }
    } else {
        alert('Form has following errors:  \n' + errors);
    }
}

const resetModal = () => {

    // Hide the deleted record message    
    document.getElementById('modalActivityIfDeleted').innerText = '';
    document.getElementById('modalActivityIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalActivityEditBtn').disabled = false;
    document.getElementById('modalActivityDeleteBtn').disabled = false;
    document.getElementById('modalActivityEditBtn').classList.remove('d-none');
    document.getElementById('modalActivityDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalActivityRecoverBtn').classList.add('d-none');

}

// Function to open the modal and populate all fields
const openModal = (actObj) => {

    resetModal();

    document.getElementById('modalActivityName').innerText = actObj.act_name || 'N/A';
    document.getElementById('modalActivityProviderName').innerText = actObj.act_provider || 'N/A';
    document.getElementById('modalActivityLocation').innerText = actObj.location || 'N/A';
    document.getElementById('modalActivityDistrict').innerText = actObj.district_id?.name || 'N/A';
    document.getElementById('modalActivityProvince').innerText = actObj.district_id?.province_id?.name || 'N/A';
    document.getElementById('modalActivityType').innerText = actObj.act_type_id.name || 'N/A';
    document.getElementById('modalActivityAdultFee').innerText = actObj.price_adult || 'N/A';
    document.getElementById('modalActivityChildFee').innerText = actObj.price_child || 'N/A';
    document.getElementById('modalActivityDuration').innerText = actObj.duration || 'N/A';
    document.getElementById('modalActivityDescription').innerText = actObj.description || 'N/A';
    document.getElementById('modalActivityNote').innerText = actObj.note || 'N/A';
    document.getElementById('modalActivityStatus').innerText = actObj.act_status || 'N/A';
    document.getElementById('modalActivityContactOne').innerText = actObj.contactone || 'N/A';
    document.getElementById('modalActivityContactTwo').innerText = actObj.contacttwo || 'N/A';
    document.getElementById('modalActivityEmail').innerText = actObj.act_email || 'N/A';

    if (actObj.deleted_act) {
        document.getElementById('modalActivityIfDeleted').classList.remove('d-none');
        document.getElementById('modalActivityIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(actObj.deleteddatetime).toLocaleString();
        document.getElementById('modalActivityEditBtn').disabled = true;
        document.getElementById('modalActivityDeleteBtn').disabled = true;
        document.getElementById('modalActivityEditBtn').classList.add('d-none');
        document.getElementById('modalActivityDeleteBtn').classList.add('d-none');
        document.getElementById('modalActivityRecoverBtn').classList.remove('d-none');
    } else {
        document.getElementById('modalActivityIfDeleted').classList.add('d-none');
        document.getElementById('modalActivityEditBtn').disabled = false;
        document.getElementById('modalActivityDeleteBtn').disabled = false;
        document.getElementById('modalActivityEditBtn').classList.remove('d-none');
        document.getElementById('modalActivityDeleteBtn').classList.remove('d-none');
        document.getElementById('modalActivityRecoverBtn').classList.add('d-none');
    }

    $('#infoModalActivity').modal('show');
};

// refill the form to edit a record
const refillActivityForm = async (actObj) => {

    activity = JSON.parse(JSON.stringify(actObj));
    oldActivity = JSON.parse(JSON.stringify(actObj));

    inputActivityName.value = actObj.act_name;
    //selectActivityType.value = actObj.act_type_id.name;
    inputShortDescription.value = actObj.description;
    inputProviderName.value = actObj.act_provider;
    //selectActivityProvince.value = actObj.district_id?.province_id?.name;
    //selectActivityDistrict.value = actObj.district_id?.name;
    inputActivityLocation.value = actObj.location;
    inputActivityEmail.value = actObj.act_email;
    inputContact1.value = actObj.contactone;
    inputContact2.value = actObj.contacttwo;
    inputActivityDuration.value = actObj.duration;
    inputAdultPrice.value = actObj.price_adult;
    inputChildPrice.value = actObj.price_child;
    inputAdditionalInfo.value = actObj.note;
    selectActivityStatus.value = actObj.act_status;

    try {
        const act_types = await ajaxGetReq("/acttype/all");
        fillDataIntoDynamicSelects(selectActivityType, 'Please Select Activity Type', act_types, 'name', actObj.act_type_id.name);

        //get province list
        provinces = await ajaxGetReq("/province/all");
        fillDataIntoDynamicSelects(selectActivityProvince, 'Please Select The Province', provinces, 'name', actObj.district_id.province_id.name);

        districts = await ajaxGetReq("/district/all");
        fillDataIntoDynamicSelects(selectActivityDistrict, 'Please Select The District', districts, 'name', actObj.district_id.name);
    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }

    document.getElementById('inputContact2').disabled = false;
    document.getElementById('selectActivityStatus').style.border = '1px solid #ced4da';

    //document.getElementById('selectActivityStatus').children[4].classList.remove('d-none');


    activityUpdateBtn.disabled = false;
    activityUpdateBtn.style.cursor = "pointer";

    activityAddBtn.disabled = true;
    activityAddBtn.style.cursor = "not-allowed";

    $("#infoModalActivity").modal("hide");

    var myActFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myActFormTab.show();

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshActivityForm();
        }
    });
});

//show value changes before update
const showActValueChanges = () => {
    let updates = "";

    if (activity.act_name != oldActivity.act_name) {
        updates = updates + " Activity Name will be changed to " + activity.act_name + "\n";
    }

    if (activity.description != oldActivity.description) {
        updates = updates + " Activity description will be changed to " + activity.description + "\n";
    }

    if (activity.act_provider != oldActivity.act_provider) {
        updates = updates + " Activity provider will be changed to " + activity.act_provider + "\n";
    }



    if (activity.contactone != oldActivity.contactone) {
        updates = updates + " Activity contact one  will be changed to " + activity.contactone + "\n";
    }

    if (activity.contacttwo != oldActivity.contacttwo) {
        updates = updates + " Activity contact two will be changed to " + activity.contacttwo + "\n";
    }

    if (activity.act_email != oldActivity.act_email) {
        updates = updates + " Activity email will be changed to " + activity.act_email + "\n";
    }

    if (activity.location != oldActivity.location) {
        updates = updates + " Activity location will be changed to " + activity.location + "\n";
    }

    if (activity.duration != oldActivity.duration) {
        updates = updates + " Activity duration  will be changed to " + activity.duration + "\n";
    }

    if (activity.price_adult != oldActivity.price_adult) {
        updates = updates + " Activity adult price will be changed to " + activity.price_adult + "\n";
    }

    if (activity.price_child != oldActivity.price_child) {
        updates = updates + " Activity child two will be changed to " + activity.price_child + "\n";
    }

    if (activity.note != oldActivity.note) {
        updates = updates + " Activity note two will be changed to " + activity.note + "\n";
    }

    if (activity.act_status != oldActivity.act_status) {
        updates = updates + " Activity status will be changed to " + activity.act_status + "\n";
    }

    if (activity.district_id.name != oldActivity.district_id.name) {
        updates = updates + " Activity district two will be changed to " + activity.district_id.name + "\n";
    }

    if (activity.act_type_id.name != oldActivity.act_type_id.name) {
        updates = updates + " Activity type two will be changed to " + activity.act_type_id.name + "\n";
    }

    return updates;
}

//fn for update button
const updateActivity = async () => {

    const errors = checkActFormErrors();
    if (errors == "") {
        let updates = showActValueChanges();
        if (updates == "") {
            alert("No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/activity", "PUT", activity);

                    if (putServiceResponse === "OK") {
                        alert("Successfully Updated");
                        document.getElementById('formActivity').reset();
                        refreshActivityForm();
                        buildActivityTable();
                        var myActTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myActTableTab.show();
                    } else {
                        alert("Update Failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                alert("User cancelled the task");
            }
        }
    } else {
        alert("Form has following errors: \n" + errors);
    }
}

//fn to delete an employee record
const deleteActivityRecord = async (actObj) => {
    const userConfirm = confirm("Are you sure to delete the activity " + actObj.act_name + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/activity", "DELETE", actObj);

            if (deleteServerResponse === 'OK') {
                alert('Record Deleted');
                $('#infoModalActivity').modal('hide');
                window.location.reload();
            } else {
                alert('Delete Failed' + deleteServerResponce);
            }
        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert("User cancelled the task")
    }
}

//restore employee record if its already deleted
// or this should call a new service to set deleted_emp as false ? 💥💥💥
const restoreActivityRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            activity = window.currentObject;
            activity.deleted_act = false;

            let putServiceResponse = await ajaxPPDRequest("/activity", "PUT", activity);

            if (putServiceResponse === "OK") {
                alert("Successfully Restored");
                $("#infoModalActivity").modal("hide");

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                alert("Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert('User cancelled the recovery task');
    }


}





//updateActivity





//get district list by province
const getDistByProvince = async () => {

    const currentProvinceID = JSON.parse(selectActivityProvince.value).id;
    selectActivityProvince.style.border = '2px solid lime';
    selectActivityDistrict.disabled = false;

    try {
        const districts = await ajaxGetReq("districts/byprovinceid/" + currentProvinceID);
        fillDataIntoDynamicSelects(selectActivityDistrict, " Please Select The District Now", districts, 'name');
    } catch (error) {
        console.error("Failed to fetch district data : ", error);
    }


}

