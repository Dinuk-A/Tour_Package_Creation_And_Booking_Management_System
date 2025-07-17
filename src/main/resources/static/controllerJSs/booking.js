window.addEventListener('load', () => {

    buildBookingTable();
    refreshBookingForm();

});

//global var to store id of the table
let sharedTableId = "mainTableBooking";

//to create and refresh content in main employee table
const buildBookingTable = async () => {

    try {
        const bookings = await ajaxGetReq("/booking/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'bookingcode', colHeadName: 'Code' },
            { displayType: 'function', displayingPropertyOrFn: showClientInfo, colHeadName: 'Client' },
            { displayType: 'function', displayingPropertyOrFn: showClientContacts, colHeadName: 'Contact' },
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

//refresh fn
const refreshBookingForm = () => {

    booking = new Object;
    externalPersonnels = new Object;
    externalVehicles = new Object;
    booking.externalPersonnels = [];
    booking.externalVehicles = [];

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


    document.getElementById('assignedVehicles').innerHTML = '';
    document.getElementById('assignedDrivers').innerHTML = '';
    document.getElementById('assignedGuides').innerHTML = '';

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

//add
const addExternalVehicle = () => {
    checkExtVehicleFormErrors();
}

// Reset external vehicle add form
const resetExtVehicleInputs = () => {
    const fieldIds = [
        "extVehName",
        "extVehPlate",
        "extVehProviderName",
        "extVehProviderContact",
        "extVehProviderEmail"
    ];

    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.style.border = "1px solid #ced4da";
        }
    });
};




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

        const clone = JSON.parse(JSON.stringify(externalPersonnels));

        // Add to booking
        booking.externalPersonnels.push(clone);

        // Get current index of the new entry
        const index = booking.externalPersonnels.length - 1;

        // Create a container div for the entry
        const driverDiv = document.createElement("div");
        driverDiv.className = "d-flex justify-content-between align-items-center mb-2 p-2 border rounded bg-light";
        driverDiv.id = `driver_${index}`;

        // Create label for the name
        const nameLabel = document.createElement("span");
        nameLabel.textContent = clone.fullname;

        // Create remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.textContent = "Remove";

        // Remove logic
        removeBtn.onclick = () => {
            // Remove from array
            booking.externalPersonnels.splice(index, 1);
            // Remove from DOM
            driverDiv.remove();
            // Optional: console log updated booking
            console.log("Updated Booking Object after removal:", booking);
        };

        // Append both to the driver div
        driverDiv.appendChild(nameLabel);
        driverDiv.appendChild(removeBtn);

        // Append to the right side section
        document.getElementById("assignedDrivers").appendChild(driverDiv);

        // Reset input fields and temp object
        resetExtDriverInputs();
        externalPersonnels = {};

        // Show full object
        console.log("Updated Booking Object:", booking);

    } else{
        showAlertModal("err","form has some errors \n " , errors);
    }
};

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
const addExternalGuide =()=>{
    checkExtGuideFormErrors();
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













