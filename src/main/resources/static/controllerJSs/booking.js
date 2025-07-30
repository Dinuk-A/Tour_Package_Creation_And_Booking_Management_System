window.addEventListener('load', () => {

    buildBookingTable();
    refreshBookingForm();
    fetchCustomTpkgs();
    //fetchConfirmedInquiries();

});

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//global vars
let vehiTypes = [];
let allTpkgs = [];
//let allInquiries = [];

//main refresh fn
const refreshBookingForm = async () => {

    booking = new Object;
    externalPersonnels = new Object;
    externalVehicles = new Object;
    booking.externalPersonnels = [];
    booking.externalVehicles = [];

    booking.int_vehicles = [];
    booking.int_drivers = [];
    booking.int_guides = [];

    booking.allVehis = [];
    booking.allGuides = [];
    booking.allDrivers = [];

    document.getElementById('formBooking').reset();

    //to fill select elements
    const emptyArray = [];

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputBookingCode',
        'inputClientName',
        'inputClientPassport',
        'inputClientEmail',
        'inputClientContact',
        'inputClientContact2',
        'inputPackagePrice',
        'inputAdvancementAmount',
        'inputTotalPaidAmount',
        'inputDueBalance',
        'bookingStartDate',
        'bookingEndDate',
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    const radiosToReset = [
        'internalVehicleRB',
        'externalVehicleRB',
        'internalDriverRB',
        'externalDriverRB',
        'internalGuideRB',
        'externalGuideRB'
    ]

    radiosToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.checked = false;
        }
    });

    //selectBookedPackage
    //selectBasedInquiry
    //availableVehicles
    //availableDrivers
    //availableGuides

    //get vehicle types 

    try {
        vehiTypes = await ajaxGetReq('/vehitypes/all');
    } catch (error) {
        console.error('fetch failed for vehicle types')
    }

    //for internal side
    fillDataIntoDynamicSelects(vehicleTypesAll, 'Please Select Type', vehiTypes, 'name');

    //for external side
    fillDataIntoDynamicSelects(extVehitype, 'Please Select Type', vehiTypes, 'name');

    //reset selected section
    //document.getElementById('assignedVehicles').innerHTML = '';
    //document.getElementById('assignedDrivers').innerHTML = '';
    //document.getElementById('assignedGuides').innerHTML = '';

}

//fetch all custom tpkgs
const fetchCustomTpkgs = async () => {

    try {
        allTpkgs = await ajaxGetReq("/tpkg/custom/completed");
    } catch (error) {
        console.error("Failed to fetch custom tpkgs:", error);
    }
}

//fetch all confirmed inquiries
//const fetchConfirmedInquiries = async () => {
//    try {
//        allInquiries = await ajaxGetReq("/inq/confirmed");
//    } catch (error) {
//        console.error("Failed to fetch confirmed inqs:", error);
//    }
//}

//global var to store id of the table
let sharedTableId = "mainTableBooking";

//to create and refresh content in main employee table
const buildBookingTable = async () => {

    try {
        const bookings = await ajaxGetReq("/booking/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'bookingcode', colHeadName: 'Code' },
            //{ displayType: 'function', displayingPropertyOrFn: showClientInfo, colHeadName: 'Client' },
            //{ displayType: 'function', displayingPropertyOrFn: showClientContacts, colHeadName: 'Contact' },
            { displayType: 'function', displayingPropertyOrFn: showBookedPkg, colHeadName: 'Package' },
            { displayType: 'function', displayingPropertyOrFn: showBookingStatus, colHeadName: 'Status' }
        ]

        createTable(tableBookingHolderDiv, sharedTableId, bookings, tableColumnInfo);

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
        console.error("Failed to build booking table:", error);
    }

}

//show in tablle
const showBookingStatus = (bookingObj) => {

    if (bookingObj.deleted_booking == null || bookingObj.deleted_booking == false) {
        if (bookingObj.booking_status == "New") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Pending Payment
                </p>`;
        } else if (bookingObj.booking_status == "Confirmed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #2980b9; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Confirmed
                </p>`;
        } else if (bookingObj.booking_status == "Cancelled") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #e67e22; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Cancelled
                </p>`;
        } else if (bookingObj.booking_status == "Completed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Completed
                </p>`;
        } else if (bookingObj.booking_status == "Rescheduled") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #8e44ad; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Rescheduled
                </p>`;
        } else if (bookingObj.booking_status == "Refunded") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #16a085; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Refunded
                </p>`;
        } else {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #7f8c8d; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Unknown
                </p>`;
        }
    } else if (bookingObj.deleted_booking != null && bookingObj.deleted_booking == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
};

//client code and name
const showClientInfo = (bookingObj) => {
    return `${bookingObj.client.clientcode} <br> ${bookingObj.client.fullname}`;
}

//client email and contact 1
const showClientContacts = (bookingObj) => {
    return `${bookingObj.client.email} <br> ${bookingObj.client.contactone}`;
}

// booked pkg
const showBookedPkg = (bookingObj) => {
    return `${bookingObj.tpkg.pkgcode} <br> ${bookingObj.tpkg.pkgtitle}`;
}

//refill function
const openModal = async (bookingObj) => {

    booking = JSON.parse(JSON.stringify(bookingObj));
    oldBooking = JSON.parse(JSON.stringify(bookingObj));

    console.log("bookingObj ", bookingObj);

    document.getElementById('inputBookingCode').value = booking.bookingcode || '';
    document.getElementById('bookingStartDate').value = booking.startdate || '';
    document.getElementById('bookingEndDate').value = booking.enddate || '';
    document.getElementById('inputClientName').value = booking.client ? booking.client.fullname : '';
    document.getElementById('inputClientPassport').value = booking.client ? booking.client.passportornic : '';
    document.getElementById('inputClientEmail').value = booking.client ? booking.client.email : '';
    document.getElementById('inputClientContact').value = booking.client ? booking.client.contactone : '';
    document.getElementById('inputClientContact2').value = booking.client ? booking.client.contacttwo : '';
    document.getElementById('inputPackagePrice').value = booking.final_price != null ? booking.final_price.toFixed(2) : '';
    document.getElementById('inputAdvancementAmount').value = booking.advancement_amount != null ? booking.advancement_amount.toFixed(2) : '';
    document.getElementById('inputTotalPaidAmount').value = booking.total_paid != null ? booking.total_paid.toFixed(2) : '';
    document.getElementById('inputDueBalance').value = booking.due_balance != null ? booking.due_balance.toFixed(2) : '';
    document.getElementById('inputNote').value = booking.note || '';
    document.getElementById('selectBookingStatus').value = booking.booking_status || '';
    document.getElementById('selectPaymentStatus').value = booking.payment_status || '';

    fillMultDataIntoDynamicSelects(selectBookedPackage, 'Please Select Package', allTpkgs, 'pkgcode', 'pkgtitle', booking.tpkg.pkgcode);
    //fillDataIntoDynamicSelects(selectBasedInquiry, 'Please Select Inquiry', allInquiries, 'inqcode', booking.tpkg.basedinq.inqcode);

    //to get available resources
    const tourStartDate = booking.startdate;
    const tourEndDate = booking.enddate;

    //fill available vehis
    internalVehicleRB.checked = true;
    try {
        const availableVehiclesByDates = await ajaxGetReq("vehi/availablevehiclesbydatesonly/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsRefillById(availableVehicles, "Please Choose A Vehicle", availableVehiclesByDates, 'numberplate', 'vehiclename');
    } catch (error) {
        console.error("Error fetching available vehicles:", error);
    }

    //fill available drivers
    internalDriverRB.checked = true;
    try {
        const availabledriversByDates = await ajaxGetReq("emp/availabledriversbydates/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsRefillById(availableDrivers, "Please Choose A Driver", availabledriversByDates, 'emp_code', 'fullname');
    } catch (error) {
        console.error("Error fetching available drivers:", error);
    }

    //fill available guides
    internalGuideRB.checked = true;
    try {
        const availableGuidesByDates = await ajaxGetReq("emp/availableguidesbydates/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsRefillById(availableGuides, "Please Choose A Driver", availableGuidesByDates, 'emp_code', 'fullname');
    } catch (error) {
        console.error("Error fetching available guides:", error);
    }

    //show pref transport method 
    const prefTrprtMsg = document.getElementById('preferredTransportMethod');
    prefTrprtMsg.innerText = booking.tpkg.pref_vehi_type ? ` ${booking.tpkg.pref_vehi_type}` : 'No preferred transport method specified';

    // Show guide preference
    const guidePrefMsg = document.getElementById('preferredGuideInfo');

    if (booking.tpkg.is_guide_needed) {
        const guideType = booking.tpkg.is_company_guide ? 'Company Guide' : 'External Guide';
        guidePrefMsg.innerText = ` ${guideType} requested`;
    } else {
        guidePrefMsg.innerText = 'No guide requested';
    }

    // Show driver preference
    const driverPrefMsg = document.getElementById('preferredDriverInfo');
    const driverType = booking.tpkg.is_company_driver ? 'Company Driver' : 'External Driver';
    driverPrefMsg.innerText = ` ${driverType} requested`;

    //refill assigned resources if they exist
    /*
     booking.externalPersonnels = [];
    booking.externalVehicles = [];

    booking.int_vehicles = [];
    booking.int_drivers = [];
    booking.int_guides = []; */

    //render internal vehicles
    if (booking.int_vehicles && booking.int_vehicles.length > 0) {
        renderAssignedInternalVehicles();
    }

    // booking.externalVehicles 
    if (booking.externalVehicles && booking.externalVehicles.length > 0) {
        renderAssignedExternalVehicles();
    }

    //booking.int_drivers
    if (booking.int_drivers && booking.int_drivers.length > 0) {
        renderAssignedInternalDrivers();
    }

    //booking.externalPersonnels(drivers)
    if (
        booking.externalPersonnels &&
        booking.externalPersonnels.some(person => person.role === "Driver")
    ) {
        renderAssignedExtDrivers();
    }

    //booking.int_guides
    if (booking.int_guides && booking.int_guides.length > 0) {
        renderAssignedInternalGuides();
    }

     //booking.externalPersonnels(guides)
    if (
        booking.externalPersonnels &&
        booking.externalPersonnels.some(person => person.role === "Guide")
    ) {
        renderAssignedExtGuides();
    }


    let myInqFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myInqFormTab.show();

    let firstTab = new bootstrap.Tab(document.getElementById('bookingStep1-tab'));
    firstTab.show();

}

//update a booking record
const updateBooking = async () => {

    try {
        let putServiceResponse = await ajaxPPDRequest("/booking", "PUT", booking);
        if (putServiceResponse === "OK") {
            showAlertModal('suc', 'Saved Successfully');
            refreshBookingForm();
            buildBookingTable();
            var myTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
            myTableTab.show();

        } else {
            showAlertModal('err', "Update Failed \n" + putServiceResponse);
        }

    } catch (error) {
        showAlertModal('err', 'An error occurred: ' + error.responseText);
    }
}


//+++++++++++++++++for vehicle handling+++++++++++++++++++++
// handle radio changes vehicle
const handleVehicleTypeChange = (selectedType) => {
    const internalContainer = document.getElementById("availableVehiclesContainer");
    const externalContainer = document.getElementById("externalVehicleFormContainer");
    const availableVehicles = document.getElementById("availableVehicles");

    if (selectedType === "internal") {
        internalContainer.classList.remove("d-none");
        externalContainer.classList.add("d-none");
    } else if (selectedType === "external") {
        internalContainer.classList.add("d-none");
        externalContainer.classList.remove("d-none");
    }
    //
    //    if (availableVehicles) {
    //        availableVehicles.selectedIndex = -1;
    //    }
};

//for ext vehi form
const checkExtVehicleFormErrors = () => {
    let errors = "";

    if (!externalVehicles.vehiname) {
        errors += "Vehicle Name cannot be empty\n";
    }

    if (!externalVehicles.numberplate) {
        errors += "Number Plate cannot be empty\n";
    }

    if (!externalVehicles.providername) {
        errors += "Provider Name cannot be empty\n";
    }

    if (!externalVehicles.providercontactone) {
        errors += "Provider Contact cannot be empty\n";
    }

    return errors;
};

//filter vehicles by type
const filterVehisByTypeToo = async (selectElement, bookingObj) => {
    const selectedVehiTypeRaw = selectElement.value;
    const selectedVehitypeObjid = JSON.parse(selectedVehiTypeRaw).id;

    const tourStartDate = bookingObj.startdate;
    const tourEndDate = bookingObj.enddate;

    try {
        const availablevehiListByTypeAndDates = await ajaxGetReq("vehi/availablevehiclesbyvehitype/" + tourStartDate + "/" + tourEndDate + "/" + selectedVehitypeObjid);
        fillMultDataIntoDynamicSelectsRefillById(availableVehicles, "Please Choose A Vehicle", availablevehiListByTypeAndDates, 'numberplate', 'vehiclename');
    } catch (error) {
        console.error('fetch vehicles by type failed')
    }

}

//add int vehi
const addIntVehi = () => {

    const selectedValue = document.getElementById('availableVehicles').value;
    const selectedVehi = JSON.parse(selectedValue);

    let isAlreadySelected = false;

    booking.int_vehicles.forEach((vehi) => {
        if (vehi.id == selectedVehi.id) {
            isAlreadySelected = true;
        }
    })

    if (isAlreadySelected) {
        showAlertModal('err', 'This vehicle is already selected')
    } else {
        booking.int_vehicles.push(selectedVehi);
        renderAssignedInternalVehicles();
    }

}

//check ext vehi duplications
const checkExtVehiDuplications = () => {
    let isAlreadySelected = false;

    const extVehiNumberPlateValue = document.getElementById('extVehPlate').value.trim();

    if (booking.externalVehicles.length === 0) {
        isAlreadySelected = false;
    } else {
        booking.externalVehicles.forEach((vehi) => {
            if (vehi) {

                // skip the vehicle currently editing
                if (extVehiBeingEdited && vehi.numberplate === extVehiBeingEdited.numberplate) {
                    return;
                }

                if (extVehiNumberPlateValue == vehi.numberplate.trim()) {
                    isAlreadySelected = true;
                }
            }
        });
    }

    console.log(booking.externalVehicles);
    return isAlreadySelected;
}

//add ext vehi
const addExternalVehicle = () => {

    const errors = checkExtVehicleFormErrors();
    const duplicationExtVehi = checkExtVehiDuplications();

    if (errors == "") {

        if (!duplicationExtVehi) {

            const userConfirm = confirm("Are you sure to add ?");
            if (userConfirm) {

                booking.externalVehicles.push(externalVehicles);
                renderAssignedExternalVehicles();
                resetExtVehicleInputs();
            }

        } else {
            showAlertModal("err", "This vehicle is already added ");
        }

    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}

// Reset external vehicle add form
const resetExtVehicleInputs = () => {

    externalVehicles = new Object;

    const fieldIds = [
        "extVehName",
        "extVehPlate",
        "extVehProviderName",
        "extVehProviderContact",
        "extVehProviderEmail",
        "extVehitype"
    ];

    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.style.border = "1px solid #ced4da";
        }
    });

    document.getElementById("btnAddExtVehicleBtnContainer").classList.remove("d-none");
    document.getElementById("btnUpdateExtVehicleBtnContainer").classList.add("d-none");

};

//render int vehicles in right side
const renderAssignedInternalVehicles = () => {

    const container = document.getElementById('selectedIntVehis');
    container.innerHTML = "";

    booking.int_vehicles.forEach((vehicle, index) => {
        const vehiRow = document.createElement("div");
        vehiRow.className = "row mb-2 align-items-center";
        vehiRow.setAttribute("data-numberplate", vehicle.numberplate);

        // vehiname
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = vehicle.vehiclename;

        // numberplate
        const contactCol = document.createElement("div");
        contactCol.className = "col";
        contactCol.innerText = vehicle.numberplate;

        // Remove button
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {

            booking.int_vehicles = booking.int_vehicles.filter(v => v.numberplate !== vehicle.numberplate);
            vehiRow.remove();
            console.log("internal vehis: ", booking.int_vehicles);

        });

        btnCol.appendChild(removeBtn);

        // Append all to row
        vehiRow.appendChild(nameCol);
        vehiRow.appendChild(contactCol);
        vehiRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(vehiRow);
    });

    console.log("internal vehis: ", booking.int_vehicles);
}

// global variable to store the external vehicle being edited
let extVehiBeingEdited = null;

//render the ext vehicles in right side
const renderAssignedExternalVehicles = () => {
    const container = document.getElementById('selectedExtVehis');
    container.innerHTML = "";

    booking.externalVehicles.forEach((vehicle, index) => {
        const vehiRow = document.createElement("div");
        vehiRow.className = "row mb-2 align-items-center";
        vehiRow.setAttribute("data-numberplate", vehicle.numberplate);

        // Vehicle name
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = vehicle.vehiname;

        // Provider contact
        const contactCol = document.createElement("div");
        contactCol.className = "col";
        contactCol.innerText = vehicle.providercontactone;

        // Action buttons (edit + remove)
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto d-flex gap-2";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-warning";
        editBtn.innerText = "Edit";
        editBtn.onclick = () => refillExtVehiForm(vehicle);

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            booking.externalVehicles = booking.externalVehicles.filter(v => v.numberplate !== vehicle.numberplate);
            vehiRow.remove();
            resetExtVehicleInputs();
            console.log("externalVehicles vehis: ", booking.externalVehicles);
        });

        // Append buttons
        btnCol.appendChild(editBtn);
        btnCol.appendChild(removeBtn);

        // Append all to row
        vehiRow.appendChild(nameCol);
        vehiRow.appendChild(contactCol);
        vehiRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(vehiRow);
    });

}

//refill the ext form with editing data
const refillExtVehiForm = (extVehiObj) => {

    document.getElementById("extVehName").value = extVehiObj.vehiname || "";
    document.getElementById("extVehPlate").value = extVehiObj.numberplate || "";
    fillDataIntoDynamicSelects(extVehitype, 'Please Select Type', vehiTypes, 'name', extVehiObj.vehicletype_id.name);
    document.getElementById("extVehProviderName").value = extVehiObj.providername || "";
    document.getElementById("extVehProviderContact").value = extVehiObj.providercontactone || "";
    document.getElementById("extVehProviderEmail").value = extVehiObj.providercontactemail || "";

    document.getElementById("btnAddExtVehicleBtnContainer").classList.add("d-none");
    document.getElementById("btnUpdateExtVehicleBtnContainer").classList.remove("d-none");

    extVehiBeingEdited = extVehiObj;
    externalVehicles = extVehiObj;
}

//updateExternalVehicle
const updateExternalVehicle = () => {
    const errors = checkExtVehicleFormErrors();
    const duplicationExtVehi = checkExtVehiDuplications();

    if (errors == "") {

        if (!duplicationExtVehi) {

            const userConfirm = confirm("Are you sure to update ?");
            if (userConfirm) {

                //const index = booking.externalVehicles.findIndex(v => v.numberplate === extVehiBeingEdited.numberplate);
                const index = booking.externalVehicles.findIndex(v => v === extVehiBeingEdited);

                if (index !== -1) {
                    booking.externalVehicles[index] = { ...externalVehicles };
                    showAlertModal('suc', "Successfully Updated");
                    renderAssignedExternalVehicles();
                    resetExtVehicleInputs();
                } else {
                    showAlertModal('err', 'Vehicle not found for update');
                }

                extVehiBeingEdited = null;
            }

        } else {
            showAlertModal("err", "This vehicle is already added ");
        }

    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}


//+++++++++++++++++for driver handling+++++++++++++++++++++
//handle radio changes driver
const handleDriverTypeChange = (selectedType) => {
    const internalContainer = document.getElementById("availableDriversContainer");
    const externalContainer = document.getElementById("externalDriverFormContainer");
    const availableDrivers = document.getElementById("availableDrivers");

    if (selectedType === "internal") {
        internalContainer.classList.remove("d-none");
        externalContainer.classList.add("d-none");
    } else if (selectedType === "external") {
        internalContainer.classList.add("d-none");
        externalContainer.classList.remove("d-none");
    }

    //if (availableDrivers) {
    //    availableDrivers.selectedIndex = -1;
    //}
};

//add int driver
const addIntDrv = () => {
    const selectedValue = document.getElementById('availableDrivers').value;
    const selectedDriver = JSON.parse(selectedValue);

    let isAlreadySelected = false;

    booking.int_drivers.forEach((driver) => {
        if (driver.id == selectedDriver.id) {
            isAlreadySelected = true;
        }
    })

    if (isAlreadySelected) {
        showAlertModal('err', 'This driver is already selected')
    } else {
        booking.int_drivers.push(selectedDriver);
        renderAssignedInternalDrivers();
        console.log("drivers ", booking.int_drivers);
    }
}

// render internal drivers in right side
const renderAssignedInternalDrivers = () => {
    const container = document.getElementById('selectedIntDrivers');
    container.innerHTML = "";

    booking.int_drivers.forEach((driver) => {
        const driverRow = document.createElement("div");
        driverRow.className = "row mb-2 align-items-center";
        driverRow.setAttribute("data-empcode", driver.emp_code);

        // emp_code
        const codeCol = document.createElement("div");
        codeCol.className = "col";
        codeCol.innerText = driver.emp_code;

        // fullname
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = driver.fullname;

        // Remove button
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            booking.int_drivers = booking.int_drivers.filter(d => d.emp_code !== driver.emp_code);
            driverRow.remove();
            console.log("internal drivers: ", booking.int_drivers);
        });

        btnCol.appendChild(removeBtn);

        // Append all to row
        driverRow.appendChild(codeCol);
        driverRow.appendChild(nameCol);
        driverRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(driverRow);
    });

    console.log("internal drivers: ", booking.int_drivers);
};


//for ext driver
const checkExtDriverFormErrors = () => {
    let errors = "";

    if (!externalPersonnels.fullname) {
        errors += "Full Name cannot be empty\n";
    }

    if (!externalPersonnels.nic) {
        errors += "NIC cannot be empty\n";
    }

    if (!externalPersonnels.email) {
        errors += "Email cannot be empty\n";
    }

    if (!externalPersonnels.contactone) {
        errors += "Mobile Number cannot be empty\n";
    }

    //check contact duplication
    if (externalPersonnels.contacttwo && externalPersonnels.contactone === externalPersonnels.contacttwo) {
        errors += "Contact Two cannot be same as Contact One\n";
    }

    return errors;
};

//for add ext driver btn
const addExternalDriver = () => {
    const errors = checkExtDriverFormErrors();
    if (errors == "") {
        const userConfirm = confirm("Are you sure to add ? \n  " + externalPersonnels.fullname);
        if (userConfirm) {
            externalPersonnels.role = "Driver";
            booking.externalPersonnels.push({ ...externalPersonnels });
            console.log(booking);

            resetExtDriverInputs();
            externalPersonnels = {};
            renderAssignedExtDrivers();
        }
    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}

//reset ext driver add form
const resetExtDriverInputs = () => {

    externalPersonnels = new Object;

    const fields = [
        "extDriverFullName",
        "extDriverNIC",
        "extDriverEmail",
        "extDriverMobile",
        "extDriverMobile2"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.style.border = "1px solid #ced4da";
        }
    });

    document.getElementById("btnAddExtDriverBtnContainer").classList.remove("d-none");
    document.getElementById("btnUpdateExtDriverBtnContainer").classList.add("d-none");
}

// global variable to store the external driver being edited
let extDriverBeingEdited = null;

//fill the selected drivers section
const renderAssignedExtDrivers = () => {
    const container = document.getElementById('selectedExtDrivers');
    container.innerHTML = "";

    // Filter only drivers
    const drivers = booking.externalPersonnels.filter(person => person.role === "Driver");

    drivers.forEach((driver, index) => {
        const driverRow = document.createElement("div");
        driverRow.className = "row mb-2 align-items-center";
        driverRow.setAttribute("data-nic", driver.nic);

        // Full Name
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = driver.fullname;

        // Contact
        const contactCol = document.createElement("div");
        contactCol.className = "col";
        contactCol.innerText = driver.contactone;

        // Action buttons (edit + remove)
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto d-flex gap-2";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-warning";
        editBtn.innerText = "Edit";
        editBtn.onclick = () => refillExtDriverForm(driver);

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            booking.externalPersonnels = booking.externalPersonnels.filter(p => p.nic !== driver.nic);
            resetExtDriverInputs();
            driverRow.remove();
        });

        // Append buttons
        btnCol.appendChild(editBtn);
        btnCol.appendChild(removeBtn);

        // Append all to row
        driverRow.appendChild(nameCol);
        driverRow.appendChild(contactCol);
        driverRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(driverRow);
    });
}

// refill the external driver form with editing data
const refillExtDriverForm = (driverObj) => {
    document.getElementById("extDriverFullName").value = driverObj.fullname || "";
    document.getElementById("extDriverNIC").value = driverObj.nic || "";
    document.getElementById("extDriverEmail").value = driverObj.email || "";
    document.getElementById("extDriverMobile").value = driverObj.contactone || "";
    document.getElementById("extDriverMobile2").value = driverObj.contacttwo || "";

    document.getElementById("btnAddExtDriverBtnContainer").classList.add("d-none");
    document.getElementById("btnUpdateExtDriverBtnContainer").classList.remove("d-none");

    document.getElementById("externalDriverFormContainer").classList.remove("d-none");

    extDriverBeingEdited = driverObj;
    externalPersonnels = driverObj;
}

// check ext driver duplications
const checkExtDriverDuplications = () => {
    let isAlreadySelected = false;

    const extDriverNICValue = document.getElementById('extDriverNIC').value.trim();

    if (booking.externalPersonnels.length === 0) {
        isAlreadySelected = false;
    } else {
        booking.externalPersonnels.forEach((person) => {
            if (person && person.role === "Driver") {

                // skip the driver currently being edited
                if (extDriverBeingEdited && person.nic === extDriverBeingEdited.nic) {
                    return;
                }

                if (extDriverNICValue === person.nic.trim()) {
                    isAlreadySelected = true;
                }
            }
        });
    }

    console.log(booking.externalPersonnels);
    return isAlreadySelected;
}

//update ext driver
const updateExternalDriver = () => {
    const errors = checkExtDriverFormErrors();
    const duplicationExtDriver = checkExtDriverDuplications();

    if (errors == "") {

        if (!duplicationExtDriver) {

            const userConfirm = confirm("Are you sure to update ?");
            if (userConfirm) {

                const index = booking.externalPersonnels.findIndex(p => p === extDriverBeingEdited);

                if (index !== -1) {
                    booking.externalPersonnels[index] = { ...externalPersonnels };
                    showAlertModal('suc', "Successfully Updated");
                    renderAssignedExtDrivers();
                    resetExtDriverInputs();
                } else {
                    showAlertModal('err', 'Driver not found for update');
                }

                extDriverBeingEdited = null;
            }

        } else {
            showAlertModal("err", "This driver is already added");
        }

    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}


//+++++++++++++++++for guide handling+++++++++++++++++++++
// handle radio changes guide
const handleGuideTypeChange = (selectedType) => {
    const internalContainer = document.getElementById("availableGuidesContainer");
    const externalContainer = document.getElementById("externalGuideFormContainer");
    const availableGuides = document.getElementById("availableGuides");

    if (selectedType === "internal") {
        internalContainer.classList.remove("d-none");
        externalContainer.classList.add("d-none");
    } else if (selectedType === "external") {
        internalContainer.classList.add("d-none");
        externalContainer.classList.remove("d-none");
    }

    //if (availableGuides) {
    //    availableGuides.selectedIndex = -1;
    //}
};

// add internal guide
const addIntGuide = () => {
    const selectedValue = document.getElementById('availableGuides').value;
    const selectedGuide = JSON.parse(selectedValue);

    let isAlreadySelected = false;

    booking.int_guides.forEach((guide) => {
        if (guide.id == selectedGuide.id) {
            isAlreadySelected = true;
        }
    });

    if (isAlreadySelected) {
        showAlertModal('err', 'This guide is already selected');
    } else {
        booking.int_guides.push(selectedGuide);
        renderAssignedInternalGuides();
        console.log("guides: ", booking.int_guides);
    }
};

// render internal guides in right side
const renderAssignedInternalGuides = () => {
    const container = document.getElementById('selectedIntGuides');
    container.innerHTML = "";

    booking.int_guides.forEach((guide) => {
        const guideRow = document.createElement("div");
        guideRow.className = "row mb-2 align-items-center";
        guideRow.setAttribute("data-empcode", guide.emp_code);

        // emp_code
        const codeCol = document.createElement("div");
        codeCol.className = "col";
        codeCol.innerText = guide.emp_code;

        // fullname
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = guide.fullname;

        // Remove button
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            booking.int_guides = booking.int_guides.filter(g => g.emp_code !== guide.emp_code);
            guideRow.remove();
            console.log("internal guides: ", booking.int_guides);
        });

        btnCol.appendChild(removeBtn);

        // Append all to row
        guideRow.appendChild(codeCol);
        guideRow.appendChild(nameCol);
        guideRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(guideRow);
    });

    console.log("internal guides: ", booking.int_guides);
};

//for ext guide form
const checkExtGuideFormErrors = () => {
    let errors = "";

    if (!externalPersonnels.fullname) {
        errors += "Full Name cannot be empty\n";
    }

    if (!externalPersonnels.nic) {
        errors += "NIC cannot be empty\n";
    }

    if (!externalPersonnels.email) {
        errors += "Email cannot be empty\n";
    }

    if (!externalPersonnels.contactone) {
        errors += "Contact Number cannot be empty\n";
    }

    //check contact duplication
    if (externalPersonnels.contacttwo && externalPersonnels.contactone === externalPersonnels.contacttwo) {
        errors += "Contact Two cannot be same as Contact One\n";
    }

    return errors;
};

//add
const addExternalGuide = () => {
    const errors = checkExtGuideFormErrors();
    if (errors == "") {
        const userConfirm = confirm("Are you sure to add ? \n " + externalPersonnels.fullname);
        if (userConfirm) {
            externalPersonnels.role = "Guide";
            booking.externalPersonnels.push({ ...externalPersonnels });
            console.log(booking);

            resetExtGuideInputs();
            externalPersonnels = {};
            renderAssignedExtGuides();
        }
    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}


// global variable to store the external driver being edited
let extGuideBeingEdited = null;

// Reset external guide add form
const resetExtGuideInputs = () => {

    externalPersonnels = new Object;

    const fields = [
        "extGuideFullName",
        "extGuideNIC",
        "extGuideEmail",
        "extGuideMobile",
        "extGuideMobile2"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.style.border = "1px solid #ced4da";
        }
    });

    document.getElementById("btnAddExtGuideContainer").classList.remove("d-none");
    document.getElementById("btnUpdateExtGuideContainer").classList.add("d-none");

};

//fill the selected ext guides section
const renderAssignedExtGuides = () => {
    const container = document.getElementById('selectedExtGuides');
    container.innerHTML = "";

    // Filter only guides
    const guides = booking.externalPersonnels.filter(person => person.role === "Guide");

    guides.forEach((guide) => {
        const guideRow = document.createElement("div");
        guideRow.className = "row mb-2 align-items-center";
        guideRow.setAttribute("data-nic", guide.nic);

        // Full Name
        const nameCol = document.createElement("div");
        nameCol.className = "col";
        nameCol.innerText = guide.fullname;

        // Contact
        const contactCol = document.createElement("div");
        contactCol.className = "col";
        contactCol.innerText = guide.contactone;

        // Action buttons (edit + remove)
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto d-flex gap-2";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-warning";
        editBtn.innerText = "Edit";
        editBtn.onclick = () => refillExtGuideForm(guide);

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {

            booking.externalPersonnels = booking.externalPersonnels.filter(p => p.nic !== guide.nic);
            resetExtGuideInputs();
            guideRow.remove();

        });

        btnCol.appendChild(editBtn);
        btnCol.appendChild(removeBtn);

        // Append all to row
        guideRow.appendChild(nameCol);
        guideRow.appendChild(contactCol);
        guideRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(guideRow);
    });
};

//refill the same section when edotong
const refillExtGuideForm = (guideObj) => {
    document.getElementById("extGuideFullName").value = guideObj.fullname || "";
    document.getElementById("extGuideNIC").value = guideObj.nic || "";
    document.getElementById("extGuideEmail").value = guideObj.email || "";
    document.getElementById("extGuideMobile").value = guideObj.contactone || "";
    document.getElementById("extGuideMobile2").value = guideObj.contacttwo || "";

    document.getElementById("btnAddExtGuideContainer").classList.add("d-none");
    document.getElementById("btnUpdateExtGuideContainer").classList.remove("d-none");

    document.getElementById("externalGuideFormContainer").classList.remove("d-none");

    extDriverBeingEdited = guideObj;
    externalPersonnels = guideObj;
}

// check ext driver duplications
const checkExtGuideDuplications = () => {
    let isAlreadySelected = false;

    const extGuideNICValue = document.getElementById('extGuideNIC').value.trim();

    if (booking.externalPersonnels.length === 0) {
        isAlreadySelected = false;
    } else {
        booking.externalPersonnels.forEach((person) => {
            if (person && person.role === "Guide") {

                // skip the driver currently being edited
                if (extGuideBeingEdited && person.nic === extGuideBeingEdited.nic) {
                    return;
                }

                if (extGuideNICValue === person.nic.trim()) {
                    isAlreadySelected = true;
                }
            }
        });
    }

    console.log(booking.externalPersonnels);
    return isAlreadySelected;
}

//update ext driver
const updateExternalGuide = () => {

    const errors = checkExtGuideFormErrors();
    const duplicationExtGuide = checkExtGuideDuplications();

    if (errors == "") {

        if (!duplicationExtGuide) {

            const userConfirm = confirm("Are you sure to update ?");
            if (userConfirm) {

                const index = booking.externalPersonnels.findIndex(p => p === extGuideBeingEdited);

                if (index !== -1) {
                    booking.externalPersonnels[index] = { ...externalPersonnels };
                    showAlertModal('suc', "Successfully Updated");
                    renderAssignedExtGuides();
                    resetExtGuideInputs();
                } else {
                    showAlertModal('err', 'Guide not found for update');
                }

                extDriverBeingEdited = null;
            }

        } else {
            showAlertModal("err", "This guide is already added");
        }

    } else {
        showAlertModal("err", "Form has some errors \n " + errors);
    }
}

//for 2nd contact num field
const sameContactError = (thisElement, otherElement) => {

    if (thisElement.value === otherElement.value) {
        showAlertModal("err", "Enter A Different Number than The Previous Contact Number")
        thisElement.style.border = '2px solid red';

        if (thisElement == "extDriverMobile" || thisElement == "extGuideMobile") {
            externalPersonnels.contactone = null;
        } else if (thisElement == "extDriverMobile2" || thisElement == "extGuideMobile2") {
            externalPersonnels.contacttwo = null;
        }

    }
    // else {
    //    thisElement.style.border = '2px solid lime';
    //    if (thisElement == "extDriverMobile" || thisElement == "extGuideMobile") {
    //        inputValidatorText(thisElement, '^[0][7][01245678][0-9]{7}$', 'externalPersonnels', 'contactone');
    //    } else if (thisElement == "extDriverMobile2" || thisElement == "extGuideMobile2") {
    //        inputValidatorText(thisElement, '^[0][7][01245678][0-9]{7}$', 'externalPersonnels', 'contacttwo')
    //    }
    //}

}












