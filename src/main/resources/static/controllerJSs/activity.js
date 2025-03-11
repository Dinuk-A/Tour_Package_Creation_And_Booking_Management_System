window.addEventListener('load', () => {

    buildActivityTable();
    refreshActivityForm();

})

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
        else if (actObj.act_status == "tactorary_closed") {
            return "Tactorary Closed"
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

// Function to open the modal and populate all fields
const openModal = (actObj) => {
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

