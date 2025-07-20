window.addEventListener('load', () => {

    buildBookingTable();
    refreshBookingForm();

});

//global vars
let vehiTypes = [];

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
        'inputBalance',
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
        if (bookingObj.booking_status == "Pending Payment") {
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

    const tourStartDate = bookingObj.startdate;
    const tourEndDate = bookingObj.enddate;
    //const tourStartDate = bookingObj.tpkg.tourstartdate;
    //const tourEndDate = bookingObj.tpkg.tourenddate;

    //fill drivers
    try {
        const availabledriversByDates = await ajaxGetReq("emp/availabledriversbydates/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsInq(availableDrivers, "Please Choose A Driver", availabledriversByDates, 'emp_code', 'fullname');
    } catch (error) {
        console.error("Error fetching available drivers:", error);
    }

    //fill guides
    try {
        const availableGuidesByDates = await ajaxGetReq("emp/availableguidesbydates/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsInq(availableGuides, "Please Choose A Driver", availableGuidesByDates, 'emp_code', 'fullname');
    } catch (error) {
        console.error("Error fetching available guides:", error);
    }

    //need to define new or use the vehi type before this
    try {
        const availableVehiclesByDates = await ajaxGetReq("vehi/availablevehiclesbydatesonly/" + tourStartDate + "/" + tourEndDate);
        fillMultDataIntoDynamicSelectsInq(availableVehicles, "Please Choose A Vehicle", availableVehiclesByDates, 'numberplate', 'vehiclename');
    } catch (error) {
        console.error("Error fetching available vehicles:", error);
    }

    let myInqFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myInqFormTab.show();

    let resourcesTab = new bootstrap.Tab(document.getElementById('bookingStep2-tab'));
    resourcesTab.show();

}

//update a booking record
const updateBooking = async () => {
    //booking
    console.log("before update ", booking);
    try {
        let putServiceResponse = await ajaxPPDRequest("/booking", "PUT", booking);
        if (putServiceResponse === "OK") {
            showAlertModal('suc', 'Saved Successfully');
            console.log("after update ", booking);
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
        fillMultDataIntoDynamicSelectsInq(availableVehicles, "Please Choose A Vehicle", availablevehiListByTypeAndDates, 'numberplate', 'vehiclename');
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
    }

    else {
        booking.externalVehicles.forEach((vehi) => {
            if (vehi) {
                console.log(vehi);
                if (extVehiNumberPlateValue == vehi.numberplate.trim()) {
                    isAlreadySelected = true;
                    //break;
                }
            }
        })
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

        editBtn.addEventListener("click", () => {

            extVehiToEdit = vehicle;

            document.getElementById("extVehName").value = vehicle.vehiname || "";
            document.getElementById("extVehPlate").value = vehicle.numberplate || "";
            fillDataIntoDynamicSelects(extVehitype, 'Please Select Type', vehiTypes, 'name', vehicle.vehicletype_id.name);
            document.getElementById("extVehProviderName").value = vehicle.providername || "";
            document.getElementById("extVehProviderContact").value = vehicle.providercontactone || "";
            document.getElementById("extVehProviderEmail").value = vehicle.providercontactemail || "";

            document.getElementById("btnAddExtVehicleBtnContainer").classList.add("d-none");
            document.getElementById("btnUpdateExtVehicleBtnContainer").classList.remove("d-none");

            //update the object
             updateExtVehicleObjectFromInputs();
           
        });    

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            booking.externalVehicles = booking.externalVehicles.filter(v => v.numberplate !== vehicle.numberplate);
            vehiRow.remove();
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

//set the current data before update
const updateExtVehicleObjectFromInputs = () => {
    externalVehicles.vehiname = document.getElementById("extVehName").value.trim();
    externalVehicles.numberplate = document.getElementById("extVehPlate").value.trim();
    externalVehicles.providername = document.getElementById("extVehProviderName").value.trim();
    externalVehicles.vehicletype_id = document.getElementById("extVehitype").value.trim();
    externalVehicles.providercontactone = document.getElementById("extVehProviderContact").value.trim();
    externalVehicles.providercontactemail = document.getElementById("extVehProviderEmail").value.trim();
};

//updateExternalVehicle
const updateExternalVehicle = () => {
    const errors = checkExtVehicleFormErrors();
    const duplicationExtVehi = checkExtVehiDuplications();

    if (errors == "") {

        if (!duplicationExtVehi) {

            const userConfirm = confirm("Are you sure to update ?");
            if (userConfirm) {

                const index = booking.externalVehicles.findIndex(v => v.numberplate === extVehiBeingEdited?.numberplate);

                if (index !== -1) {
                    booking.externalVehicles[index] = { ...externalVehicles };
                    renderAssignedExternalVehicles();
                    resetExtVehicleInputs();
                    document.getElementById("btnAddExtVehicleBtnContainer").classList.remove("d-none");
                    document.getElementById("btnUpdateExtVehicleBtnContainer").classList.add("d-none");
                } else {
                    showAlertModal('err', 'Vehicle not found for update');
                }
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

    // contacttwo is optional, so no check here

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
}

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

        // Remove button
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {

            booking.externalPersonnels = booking.externalPersonnels.filter(p => p.nic !== driver.nic);
            driverRow.remove();

        });

        btnCol.appendChild(removeBtn);

        // Append all to row
        driverRow.appendChild(nameCol);
        driverRow.appendChild(contactCol);
        driverRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(driverRow);
    });
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

// Reset external guide add form
const resetExtGuideInputs = () => {
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

        // Remove button
        const btnCol = document.createElement("div");
        btnCol.className = "col-auto";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            // Remove from array
            booking.externalPersonnels = booking.externalPersonnels.filter(p => p.nic !== guide.nic);

            // Remove from DOM
            guideRow.remove();
        });

        btnCol.appendChild(removeBtn);

        // Append all to row
        guideRow.appendChild(nameCol);
        guideRow.appendChild(contactCol);
        guideRow.appendChild(btnCol);

        // Append row to container
        container.appendChild(guideRow);
    });
};













