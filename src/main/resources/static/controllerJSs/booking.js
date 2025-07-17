window.addEventListener('load', () => {

    refreshBookingForm();

});

//refresh fn
const refreshBookingForm = () => {
    booking = new Object;
    externalPersonnel = new Object;
    booking.externalPersonnels = [];
}

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
            el.style.border = "1px solid #ced4da"; // Bootstrap default
        }
    });
}

//for add ext driver btn
const addExternalDriver = () => {
    const clone = JSON.parse(JSON.stringify(externalPersonnel));

    // Ensure name exists before adding
    if (!clone.fullname || clone.fullname.trim() === "") {
        alert("Please enter the full name of the external driver.");
        return;
    }

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
    externalPersonnel = {};

    // Show full object
    console.log("Updated Booking Object:", booking);
};


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

