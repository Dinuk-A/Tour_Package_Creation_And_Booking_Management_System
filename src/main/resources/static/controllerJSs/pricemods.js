window.addEventListener('load', () => {
    refreshPriceConfigForm();
    refillForminputs();
});

// globally accessible
let oldPriceModObj = null;

//  to refill form inputs with existing data (💥💥default values ???)
const refillForminputs = async () => {

    try {

        const pricemods = await ajaxGetReq("/pricemods/all");
        console.log('initial pricemods:', pricemods);

        oldPriceModObj = JSON.parse(JSON.stringify(pricemods));
        //oldPriceModObj = pricemods;

        console.log("Old Price Modifications Object:", oldPriceModObj);
       
        document.getElementById('companyProfitMargin').value = parseFloat(pricemods.company_profit_margin).toFixed(2);
        document.getElementById('extDriverSurcharge').value = parseFloat(pricemods.ext_driver_percentage).toFixed(2);
        document.getElementById('extVehicleSurcharge').value = parseFloat(pricemods.ext_vehicle_percentage).toFixed(2);
        document.getElementById('extGuideSurcharge').value = parseFloat(pricemods.ext_guide_percentage).toFixed(2);

    } catch (error) {
        console.error("Failed to build table:", error);
        return
    }

    const inputIds = ['companyProfitMargin', 'extDriverSurcharge', 'extVehicleSurcharge', 'extGuideSurcharge'];

    inputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.style.border = "1px solid #ced4da";
            inputElement.disabled = true;
        }
    });

}

// refresh the main form
const refreshPriceConfigForm = () => {
    pricemod = new Object();
}

// to enable input fields for editing
const enableInput = (inputId) => {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        if (!inputElement.disabled) {
            alert("This input is already enabled.");
        } else {
            inputElement.disabled = false;
        }
    }
}

// to save the modified values(update the database)
const updatePriceMods2 = async () => {

    const companyProfitMargin = parseFloat(document.getElementById('companyProfitMargin').value);
    const extDriverSurcharge = parseFloat(document.getElementById('extDriverSurcharge').value);
    const extVehicleSurcharge = parseFloat(document.getElementById('extVehicleSurcharge').value);
    const extGuideSurcharge = parseFloat(document.getElementById('extGuideSurcharge').value);

    if (isNaN(companyProfitMargin) || isNaN(extDriverSurcharge) || isNaN(extVehicleSurcharge) || isNaN(extGuideSurcharge)) {
        alert("Please enter valid numeric values.");
        return;
    }

    try {
        await ajaxPostReq("/pricemods/update", {
            company_profit_margin: companyProfitMargin,
            ext_driver_percentage: extDriverSurcharge,
            ext_vehicle_percentage: extVehicleSurcharge,
            ext_guide_percentage: extGuideSurcharge
        });

        alert("Price modifications saved successfully.");
        refillForminputs(); // Refresh the form inputs after saving

    } catch (error) {
        console.error("Failed to save price modifications:", error);
        alert("Failed to save price modifications. Please try again.");
    }
}

// enable form update button when any input value changes
const enableFormUpdateBtn = () => {
    document.getElementById('pricemodsUpdateBtn').disabled = false;
};

// fn to hold the price modification current values
const collectPriceModFormValues = () => {
    pricemod.company_profit_margin = document.getElementById('companyProfitMargin').value.trim();
    pricemod.ext_driver_percentage = document.getElementById('extDriverSurcharge').value.trim();
    pricemod.ext_vehicle_percentage = document.getElementById('extVehicleSurcharge').value.trim();
    pricemod.ext_guide_percentage = document.getElementById('extGuideSurcharge').value.trim();

    console.log("Collected Price Modifications:", pricemod);
};


// check errors before submitting the PriceMods form
const checkPriceModsFormErrors = () => {
    let errors = "";

    if (pricemod.company_profit_margin == null || pricemod.company_profit_margin === "") {
        errors += "Company Profit Margin cannot be empty\n";
    }

    if (pricemod.ext_driver_percentage == null || pricemod.ext_driver_percentage === "") {
        errors += "External Driver Surcharge cannot be empty\n";
    }

    if (pricemod.ext_vehicle_percentage == null || pricemod.ext_vehicle_percentage === "") {
        errors += "External Vehicle Surcharge cannot be empty\n";
    }

    if (pricemod.ext_guide_percentage == null || pricemod.ext_guide_percentage === "") {
        errors += "External Guide Surcharge cannot be empty\n";
    }

    return errors;
};

// to show the changes made in the PriceMods form
const showPriceModValueChanges = () => {

    console.log('obj values when showing changes');
    console.log("Current Price Modifications:", pricemod);
    console.log("Old Price Modifications:", oldPriceModObj);

    let updates = "";

    if (parseFloat(pricemod.company_profit_margin) !== parseFloat(oldPriceModObj.company_profit_margin)) {
        updates += `Company Profit Margin will be changed from "${oldPriceModObj.company_profit_margin}" to "${pricemod.company_profit_margin}"\n`;
    }

    if (parseFloat(pricemod.ext_driver_percentage) !== parseFloat(oldPriceModObj.ext_driver_percentage)) {
        updates += `External Driver Surcharge will be changed from "${oldPriceModObj.ext_driver_percentage}" to "${pricemod.ext_driver_percentage}"\n`;
    }

    if (parseFloat(pricemod.ext_vehicle_percentage) !== parseFloat(oldPriceModObj.ext_vehicle_percentage)) {
        updates += `External Vehicle Surcharge will be changed from "${oldPriceModObj.ext_vehicle_percentage}" to "${pricemod.ext_vehicle_percentage}"\n`;
    }

    if (parseFloat(pricemod.ext_guide_percentage) !== parseFloat(oldPriceModObj.ext_guide_percentage)) {
        updates += `External Guide Surcharge will be changed from "${oldPriceModObj.ext_guide_percentage}" to "${pricemod.ext_guide_percentage}"\n`;
    }

    return updates;
};

// Function for updating PriceMods record
const updatePriceMods = async () => {

    collectPriceModFormValues();
    const errors = checkPriceModsFormErrors();
    if (errors === "") {
        let updates = showPriceModValueChanges();

        if (updates === "") {
            showAlertModal('err', "No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed?\n\n" + updates);

            if (userConfirm) {
                try {
                    let putServiceResponse = await ajaxPPDRequest("/pricemods", "PUT", pricemod);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', 'Saved Successfully');
                        document.getElementById('formPriceMods').reset();
                        refreshPriceConfigForm();
                        refillForminputs();
                    } else {
                        showAlertModal('err', "Update Failed\n" + putServiceResponse);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                showAlertModal('inf', 'User cancelled the task');
            }

        }
    } else {
        showAlertModal('war', errors);
    }

};


