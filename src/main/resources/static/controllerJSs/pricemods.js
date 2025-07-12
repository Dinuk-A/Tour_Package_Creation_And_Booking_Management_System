window.addEventListener('load', () => {
    refreshPriceConfigForm();
    refillForminputs();
    buildPMHistoryTable();

    document.querySelectorAll('input.form-control').forEach(input => {
        input.style.textAlign = 'center';
    });

});

//global var to store id of the table
let sharedTableId = "mainTablePModHistory";

// globally accessible
let oldPriceModObj = null;

//  to refill form inputs with existing data (💥💥default values ???)
const refillForminputs = async () => {

    try {

        const pricemods = await ajaxGetReq("/pricemods/all");
        console.log('initial pricemods:', pricemods);

        oldPriceModObj = JSON.parse(JSON.stringify(pricemods));
        console.log("Old Price Modifications Object:", oldPriceModObj);

        document.getElementById('companyProfitMargin').value = parseFloat(pricemods.company_profit_margin).toFixed(2);
        document.getElementById('promoDiscount').value = parseFloat(pricemods.temp_promo_discount).toFixed(2);
        document.getElementById('offPeakDiscount').value = parseFloat(pricemods.off_peak_discount).toFixed(2);
        document.getElementById('loyaltyDiscount').value = parseFloat(pricemods.loyalty_discount).toFixed(2);
        document.getElementById('extDriverDailyCharge').value = parseFloat(pricemods.ext_driver_daily_charge).toFixed(2);
        document.getElementById('extGuideDailyCharge').value = parseFloat(pricemods.ext_guide_daily_charge).toFixed(2);
        document.getElementById('intDriverDailyCost').value = parseFloat(pricemods.int_driver_daily_cost).toFixed(2);
        document.getElementById('intGuideDailyCost').value = parseFloat(pricemods.int_guide_daily_cost).toFixed(2);
        document.getElementById('lastModifiedDateInput').value = pricemods.updateddatetime.split('T')[0];

        const promoActiveToggle = document.getElementById('promoActiveToggle');

        if (pricemods.is_promo_active) {
            promoActiveToggle.checked = true;
        } else {
            promoActiveToggle.checked = false;
        }

        handleTempPromoStatus();

    } catch (error) {
        console.error("Failed to build table:", error);
        return
    }

    const inputIds = ['companyProfitMargin',
        'extDriverDailyCharge',
        'extGuideDailyCharge',
        'intDriverDailyCost',
        'intGuideDailyCost',
        'promoDiscount',
        'offPeakDiscount',
        'loyaltyDiscount'];

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

    const updateBtn = document.getElementById('pricemodsUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";
}

//a custom table creation function because in this table we dont need a model since all info are visible in one window(full table)
const createPriceModsTableCustomFn = (dataContainer) => {

    // Clear out any previous data
    tablePriceModHistoryHolderDiv.innerHTML = '';

    // Create main table tag
    const tableTag = document.createElement('table');
    tableTag.setAttribute('class', 'table table-bordered table-striped border-primary mt-2 mb-2');
    tableTag.setAttribute('id', sharedTableId);

    // Create thead
    const tableHead = document.createElement('thead');

    // Create a row for the head
    const tableHeadRow = document.createElement('tr');

    // Add the index column first
    const indexTH = document.createElement('th');
    indexTH.innerText = '#';
    tableHeadRow.appendChild(indexTH);

    //Array containing info related to table build
    const tableColumnInfoArray = [
        { displayType: 'function', displayingPropertyOrFn: showActiveDateRange, colHeadName: 'Usage Period' },
        { displayType: 'function', displayingPropertyOrFn: showAllOldValues, colHeadName: 'Previous Values' },
        { displayType: 'function', displayingPropertyOrFn: showUpdatedUnT, colHeadName: 'Updated By' }
    ]

    // Add other column headers
    tableColumnInfoArray.forEach(columnObj => {
        const columnHead = document.createElement('th');
        columnHead.innerText = columnObj.colHeadName;
        columnHead.setAttribute('class', ('text-center justify-content-center col-head col-' + columnObj.colHeadName));
        tableHeadRow.appendChild(columnHead);
    });

    // Append the row to the thead
    tableHead.appendChild(tableHeadRow);

    // Create tbody
    const tableBody = document.createElement('tbody');

    // Populate tbody with data
    dataContainer.forEach(async (record, index) => {
        const row = document.createElement('tr');

        // Index column
        const indexCell = document.createElement('td');
        indexCell.innerText = index + 1;
        indexCell.setAttribute('class', 'text-center justify-content-center');
        row.appendChild(indexCell);

        // Data columns
        for (const columnObj of tableColumnInfoArray) {
            const cell = document.createElement('td');
            cell.setAttribute('class', 'text-center justify-content-center');

            switch (columnObj.displayType) {
                case "text":
                    cell.innerText = record[columnObj.displayingPropertyOrFn];
                    break;

                case "function":
                    const result = columnObj.displayingPropertyOrFn(record);

                    if (result instanceof Promise) {
                        result.then(resolvedHtml => {
                            cell.innerHTML = resolvedHtml;
                        }).catch(err => {
                            cell.innerHTML = `<span class="text-danger">Error loading</span>`;
                            console.error("Error resolving async cell:", err);
                        });
                    } else {
                        cell.innerHTML = result;
                    }
                    break;

                default:
                    showAlertModal('err', "Error creating table");
                    break;
            }

            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    });


    // Append thead and tbody to the table
    tableTag.appendChild(tableHead);
    tableTag.appendChild(tableBody);

    // Append the table to the holder div
    tablePriceModHistoryHolderDiv.appendChild(tableTag);
}

// fill table with active date range of previous price modifications
const showActiveDateRange = (objPMHistory) => {
    return `
        <div class="text-start px-3 justify-content-center">
            From: ${objPMHistory.ori_addeddatetime.slice(0, 10)}<br>
            Till: ${objPMHistory.ori_updateddatetime.slice(0, 10)}
        </div>
    `;
};

// fill table with all old values of previous price modifications
const showAllOldValues = (objPMHistory) => {
    return `
        <div>
            <div class='text-start px-3'>Company Profit Margin: ${objPMHistory.old_cpm}%</div>
            <div class='text-start px-3'>Promotional Discount Rate: ${objPMHistory.old_promo}%</div>
            <div class='text-start px-3'>Off-peak Discount Rate: ${objPMHistory.old_offpd}%</div>
            <div class='text-start px-3'>Loyalty Discount Rate: ${objPMHistory.old_loyd}%</div>
            <div class='text-start px-3'>External Driver Daily Charge: ${objPMHistory.old_ed_dc} LKR</div>
            <div class='text-start px-3'>External Guide Daily Charge: ${objPMHistory.old_eg_dc} LKR</div>
            <div class='text-start px-3'>Internal Driver Daily Cost: ${objPMHistory.old_id_dc} LKR</div>
            <div class='text-start px-3'>Internal Guide Daily Cost: ${objPMHistory.old_ig_dc} LKR</div>
        </div>
    `;
};

//fn to get emp info by user id
//let empInfo;
//const getEmpInfo = async (userId) => {
//    try {
//        empInfo = await ajaxGetReq("empinfo/byuserid?userid=" + userId);
//        console.log("Employee Info in common Fn:", empInfo);
//       
//    } catch (error) {
//        console.error("Failed to fetch empinfo:", error);
//    }
//}

// fill table with updated user and time of previous price modifications
const showUpdatedUnT = async (objPMHistory) => {

    const dt = new Date(objPMHistory.ori_updateddatetime);
    const formattedDate = dt.toLocaleDateString('en-GB');
    const formattedTime = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    try {
        empInfo = await ajaxGetReq("empinfo/byuserid?userid=" + objPMHistory.ori_updateduserid);
        console.log("Employee Info in showUpdatedUnT Fn TRY CATCH:", empInfo);
    } catch (error) {
        console.error("Failed to fetch empinfo:", error);
    }

    console.log("empInfo in showUpdatedUnT ", empInfo);

    return `
        <div class= "text-start px-5">
            Updated at:   ${formattedDate} ${formattedTime}<br>
            Updtated by:   ${empInfo.fullname}  (${empInfo.emp_code})<br>
        </div>
    `;
};

//  By User:   ${objPMHistory.ori_updateduserid}
//empInfo = await getEmpInfo(objPMHistory.ori_updateduserid);

//define fn for refresh privilege table
const buildPMHistoryTable = async () => {

    try {

        const pmHistory = await ajaxGetReq("/pricemodhistory/all");
        console.log("Price Mod History Data:", pmHistory);

        createPriceModsTableCustomFn(pmHistory);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build price mod history table:", error);
        console.log("*****************");
        console.error("jqXHR:", error.jqXHR);
        console.error("Status:", error.textStatus);
        console.error("Error Thrown:", error.errorThrown);
    }

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

//handle temporary promotional status
const handleTempPromoStatus = () => {

    const promoActiveToggle = document.getElementById('promoActiveToggle');
    const promoActiveLabel = document.getElementById('promoActiveLabel');

    if (promoActiveToggle.checked) {
        promoActiveLabel.textContent = 'Active';
        promoActiveLabel.classList.remove('text-danger');
        promoActiveLabel.classList.add('text-success','fw-bold');
        pricemod.is_promo_active = true;
    } else {
        promoActiveLabel.textContent = 'Inactive';
        promoActiveLabel.classList.remove('text-success','fw-bold');
        promoActiveLabel.classList.add('text-danger');
        pricemod.is_promo_active = false;
    }

}

// enable form update button when any input value changes
const enableFormUpdateBtn = () => {
    const updateBtn = document.getElementById('pricemodsUpdateBtn');
    updateBtn.disabled = false;
    updateBtn.style.cursor = "pointer";
};

// fn to hold the price modification current values
const collectPriceModFormValues = () => {
    pricemod.company_profit_margin = document.getElementById('companyProfitMargin').value.trim();
    pricemod.temp_promo_discount = document.getElementById('promoDiscount').value.trim();
    pricemod.off_peak_discount = document.getElementById('offPeakDiscount').value.trim();
    pricemod.loyalty_discount = document.getElementById('loyaltyDiscount').value.trim();
    pricemod.ext_driver_daily_charge = document.getElementById('extDriverDailyCharge').value.trim();
    pricemod.ext_guide_daily_charge = document.getElementById('extGuideDailyCharge').value.trim();
    pricemod.int_driver_daily_cost = document.getElementById('intDriverDailyCost').value.trim();
    pricemod.int_guide_daily_cost = document.getElementById('intGuideDailyCost').value.trim();

    console.log("Collected Price Modifications:", pricemod);
};

// check errors before submitting the PriceMods form
const checkPriceModsFormErrors = () => {
    let errors = "";

    if (pricemod.company_profit_margin == null || pricemod.company_profit_margin === "") {
        errors += "Company Profit Margin cannot be empty\n";
    }

    //if (pricemod.temp_promo_discount == null || pricemod.temp_promo_discount === "") {
    //    errors += "Temporary Promotional Discount Rate cannot be empty\n";
    //}

    if (pricemod.off_peak_discount == null || pricemod.off_peak_discount === "") {
        errors += "Off-Peak Discount Rate cannot be empty\n";
    }

    if (pricemod.loyalty_discount == null || pricemod.loyalty_discount === "") {
        errors += "Loyalty Discount Rate cannot be empty\n";
    }

    if (pricemod.ext_driver_daily_charge == null || pricemod.ext_driver_daily_charge === "") {
        errors += "External Driver Daily Charge cannot be empty\n";
    }

    if (pricemod.ext_guide_daily_charge == null || pricemod.ext_guide_daily_charge === "") {
        errors += "External Guide Daily Charge cannot be empty\n";
    }

    if (pricemod.int_driver_daily_cost == null || pricemod.int_driver_daily_cost === "") {
        errors += "Internal Driver Daily Cost cannot be empty\n";
    }

    if (pricemod.int_guide_daily_cost == null || pricemod.int_guide_daily_cost === "") {
        errors += "Internal Guide Daily Cost cannot be empty\n";
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
        updates += `Company Profit Margin will be changed to "${pricemod.company_profit_margin}"\n`;
    }

    if (parseFloat(pricemod.temp_promo_discount) !== parseFloat(oldPriceModObj.temp_promo_discount)) {
        updates += `Temporary Promotional Discount Rate will be changed to "${pricemod.temp_promo_discount}"\n`;
    }

    if (parseFloat(pricemod.off_peak_discount) !== parseFloat(oldPriceModObj.off_peak_discount)) {
        updates += `Off-Peak Discount Rate will be changed to "${pricemod.off_peak_discount}"\n`;
    }

    if (parseFloat(pricemod.loyalty_discount) !== parseFloat(oldPriceModObj.loyalty_discount)) {
        updates += `Loyalty Discount Rate will be changed to "${pricemod.loyalty_discount}"\n`;
    }

    if (parseFloat(pricemod.ext_driver_daily_charge) !== parseFloat(oldPriceModObj.ext_driver_daily_charge)) {
        updates += `External Driver Daily Charge will be changed to "${pricemod.ext_driver_daily_charge}" LKR\n`;
    }

    if (parseFloat(pricemod.ext_guide_daily_charge) !== parseFloat(oldPriceModObj.ext_guide_daily_charge)) {
        updates += `External Guide Daily Charge will be changed to "${pricemod.ext_guide_daily_charge}" LKR\n`;
    }

    if (parseFloat(pricemod.int_driver_daily_cost) !== parseFloat(oldPriceModObj.int_driver_daily_cost)) {
        updates += `Internal Driver Daily Cost will be changed to "${pricemod.int_driver_daily_cost}" LKR\n`;
    }

    if (parseFloat(pricemod.int_guide_daily_cost) !== parseFloat(oldPriceModObj.int_guide_daily_cost)) {
        updates += `Internal Guide Daily Cost will be changed to "${pricemod.int_guide_daily_cost}" LKR\n`;
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

                    console.log("Preparing to update Price Modifications before update:", pricemod);
                    console.log("Old Price Modifications Object before update:", oldPriceModObj);
                    pricemod.addeddatetime = oldPriceModObj.addeddatetime;
                    pricemod.addeduserid = oldPriceModObj.addeduserid;
                    console.log("Sending updated Price Modifications before update FINALLLLL:", pricemod);

                    let putServiceResponse = await ajaxPPDRequest("/pricemods", "PUT", pricemod);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', 'Saved Successfully');
                        document.getElementById('formPriceMods').reset();
                        window.location.reload();
                        //refreshPriceConfigForm();
                        //refillForminputs();
                        //buildPMHistoryTable();
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


