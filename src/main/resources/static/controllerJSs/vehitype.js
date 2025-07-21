window.addEventListener('load', () => {

    buildVehitypeTable();
    refreshVehitypeForm();

})


//global var to store id of the table
let sharedTableId = "mainTableVehitype";

//to create and refresh content in main vehitype table
const buildVehitypeTable = async () => {

    try {
        const vehitypes = await ajaxGetReq("/vehitypes/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Type Name' },
            { displayType: 'function', displayingPropertyOrFn: showInternalAvgCPKM, colHeadName: 'Avg Cost per KM (Internal)' },
            { displayType: 'function', displayingPropertyOrFn: showExternalAvgCPKM, colHeadName: 'Avg Cost per KM (External)' },
        ]

        createTable(tableVehicleTypeHolderDiv, sharedTableId, vehitypes, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: false, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build vehitype table:", error);
    }

}

// to show internal average cost per KM
const showInternalAvgCPKM = (vtObj) => {
    const amount = parseFloat(vtObj.int_avg_cpkm);
    return `LKR ${amount.toFixed(2)}`;
}

// to show external average cost per KM
const showExternalAvgCPKM = (vtObj) => {
    const amount = parseFloat(vtObj.ext_avg_cpkm);
    return `LKR ${amount.toFixed(2)}`;
}

//fn to ready the main form for accept values
const refreshVehitypeForm = () => {

    vehitype = new Object();

    document.getElementById('formVehitype').reset();

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputVehicleName',
        'inputInternalAvgCPKMPrice',
        'inputExternalAvgCPKMPPrice'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    vehiTypeUpdateBtn.disabled = true;
    vehiTypeUpdateBtn.style.cursor = "not-allowed";

    vehiTypeAddBtn.disabled = false;
    vehiTypeAddBtn.style.cursor = "pointer";

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshVehitypeForm();
        }
    });
});

// validate form before submitting
const checkVehiTypeFormErrors = () => {
    let errors = "";

    if (vehitype.name === undefined || vehitype.name.trim() === "") {
        errors += "Vehicle Type Name is required.";
    }

    if (vehitype.int_avg_cpkm === undefined || isNaN(vehitype.int_avg_cpkm) || vehitype.int_avg_cpkm < 0) {
        errors += "Internal Average Cost per KM must be a valid non-negative number.";
    }

    if (vehitype.ext_avg_cpkm === undefined || isNaN(vehitype.ext_avg_cpkm) || vehitype.ext_avg_cpkm < 0) {
        errors += "External Average Cost per KM must be a valid non-negative number.";
    }

    return errors;
}

// to add a new record in vehitype table
const addNewVehicleType = async () => {

    const errors = checkVehiTypeFormErrors();
    if (errors === '') {
        const userConfirm = confirm('Are you sure to add this Vehicle Type?');

        if (userConfirm) {
            try {
                const postServerResponse = await ajaxPPDRequest("/vehitype", "POST", vehitype);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Vehicle Type Saved Successfully');
                    document.getElementById('formVehitype').reset();
                    refreshVehitypeForm();
                    buildVehitypeTable();
                    const vtTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    vtTableTab.show();
                } else {
                    showAlertModal('err', 'Submit Failed: ' + postServerResponse);
                }
            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText));
            }
        } else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('war', errors);
    }
};


//show value changes before update
const showVTValueChanges = () => {

    let updates = "";

    if (vehitype.name !== oldVehitype.name) {
        updates += `Name changed from '${oldVehitype.name}' to '${vehitype.name}'. `;
    }

    if (vehitype.int_avg_cpkm !== oldVehitype.int_avg_cpkm) {
        updates += `Internal Avg Cost per KM changed from '${oldVehitype.int_avg_cpkm.toFixed(2)}' to '${vehitype.int_avg_cpkm.toFixed(2)}'. `;
    }

    if (vehitype.ext_avg_cpkm !== oldVehitype.ext_avg_cpkm) {
        updates += `External Avg Cost per KM changed from '${oldVehitype.ext_avg_cpkm.toFixed(2)}' to '${vehitype.ext_avg_cpkm.toFixed(2)}'. `;
    }

    return updates;

}


// refill fn
const openModal = (vehitypeObj) => {

    vehitype = JSON.parse(JSON.stringify(vehitypeObj));
    oldVehitype = JSON.parse(JSON.stringify(vehitypeObj));

    //fill the form with the object
    document.getElementById('inputVehicleName').value = vehitypeObj.name;
    document.getElementById('inputInternalAvgCPKMPrice').value = vehitypeObj.int_avg_cpkm.toFixed(2);
    document.getElementById('inputExternalAvgCPKMPPrice').value = vehitypeObj.ext_avg_cpkm.toFixed(2);

    //enable update button
    vehiTypeUpdateBtn.disabled = false;
    vehiTypeUpdateBtn.style.cursor = "pointer";

    //disable add button
    vehiTypeAddBtn.disabled = true;
    vehiTypeAddBtn.style.cursor = "not-allowed";

    var myVTFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myVTFormTab.show();

}

// to update record in vehitype table
const updateVehicleType = async () => {

    const errors = checkVehiTypeFormErrors();
    if (errors === "") {
        let updates = showVTValueChanges();
        if (updates === "") {
            showAlertModal('war', "No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed?\n\n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/vehitype", "PUT", vehitype);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', "Successfully Updated");
                        document.getElementById('formVehitype').reset();
                        refreshVehitypeForm();
                        buildVehitypeTable();
                        var myVTTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myVTTableTab.show();
                    } else {
                        showAlertModal('err', "Update Failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText));
                }
            } else {
                showAlertModal('inf', "User cancelled the task");
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}



