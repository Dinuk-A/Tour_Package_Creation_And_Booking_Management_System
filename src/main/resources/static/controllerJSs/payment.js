window.addEventListener('load', () => {

    buildPaymentTable();
    refreshPaymentForm();
    refreshSearchSection();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshPaymentForm();
        }
    });
});


//global var to store id of the table
let sharedTableId = "mainTablePayment";

//to create and refresh content in main payment table
const buildPaymentTable = async () => {

    try {
        const payments = await ajaxGetReq("/payment/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'paymentcode', colHeadName: 'Code' },
            { displayType: 'function', displayingPropertyOrFn: showPaidAmount, colHeadName: 'Paid Amount' },
            { displayType: 'function', displayingPropertyOrFn: showRelatedBookingCode, colHeadName: 'Booking ID' },
            { displayType: 'function', displayingPropertyOrFn: showClientName, colHeadName: 'Client' },
            //{ displayType: 'function', displayingPropertyOrFn: showPaymentStatus, colHeadName: 'Status' }
        ]

        createTable(tablePaymentHolderDiv, sharedTableId, payments, tableColumnInfo);

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
        console.error("Failed to build payment table:", error);
    }

}

// to support the table creation
const showPaidAmount = (payObj) => {

    if (payObj && payObj.paid_amount) {
        return `LKR ${payObj.paid_amount.toFixed(2)}`;
    }

}

// to support the table creation
const showRelatedBookingCode = (payObj) => {
    //booking_id.bookingcode
    if (payObj && payObj.booking_id && payObj.booking_id.bookingcode) {
        return payObj.booking_id.bookingcode;
    } else {
        return 'N/A';
    }
}

// to support the table creation
const showClientName = (payObj) => {

    if (payObj && payObj.booking_id && payObj.booking_id.client && payObj.booking_id.client && payObj.booking_id.client.fullname) {
        return payObj.booking_id.client.fullname;
    } else {
        return 'N/A';
    }

}

//global vars
//let allTpkgs = [];

//fetch all custom tpkgs
//const fetchCustomTpkgs = async () => {
//
//    try {
//        allTpkgs = await ajaxGetReq("/tpkg/custom/completed");
//    } catch (error) {
//        console.error("Failed to fetch custom tpkgs:", error);
//    }
//}

//globally saved to use with search
let allUnpaidBookings = [];

// refreshes the payment form
const refreshPaymentForm = async () => {

    payment = new Object();
    //document.getElementById('formPayment').reset(); is hidden in search refresh fn

    try {
        allUnpaidBookings = await ajaxGetReq("/booking/unpaid")
        fillDataIntoDynamicSelects(selectBooking, 'Select Booking', allUnpaidBookings, 'bookingcode');
    } catch (error) {
        console.error("Failed to fetch Bookings : ", error);
    }

    const inputTagsIds = [
        'selectBooking',
        'selectBookedPackage',
        'inputClientName',
        'inputClientEmail',
        'inputClientContact',
        'inputClientPassport',
        'inputTotalAmount',
        'inputBalanceAmount',
        'inputAdvancementAmount',
        'inputPaidAmount',
        'inputPaymentMethod',
        'inputPaidDate',
        //'selectPaymentStatus',
        'inputNote'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    // Reset the preview image for the payment slip
    const previewSlipImgEle = document.getElementById('previewSlipImg');
    previewSlipImgEle.src = 'images/slip.png';
    previewSlipImgEle.style.border = "1px solid #ced4da";
    fileInputSlipPhoto = null;

    //disable update btn 
    const paymentUpdateBtnEle = document.getElementById('paymentUpdateBtn');
    paymentUpdateBtnEle.disabled = true;
    paymentUpdateBtnEle.style.cursor = 'not-allowed';

    //enable add btn
    const paymentAddBtnEle = document.getElementById('paymentAddBtn');
    paymentAddBtnEle.disabled = false;
    paymentAddBtnEle.style.cursor = 'pointer';

    restrictFutureDates();

}

// fn to reset the search section
const refreshSearchSection = () => {

    document.getElementById('formPayment').reset();

    const searchTypeSelect = document.getElementById("searchType");
    searchTypeSelect.value = '';
    searchTypeSelect.style.border = "1px solid #ced4da";

    const searchValueInput = document.getElementById("searchValue");
    searchValueInput.value = '';
    searchValueInput.disabled = true;
    searchValueInput.style.border = "1px solid #ced4da";

}

//  a fn to restrict choosing future dates than today 
const restrictFutureDates = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputPaidDate').setAttribute('max', today);
};

//changesBasedMethod
const changeBasedPaymentMethod = (selectEle) => {

    const selectImgBtn = document.getElementById('selectImgBtn');
    const clearImgBtn = document.getElementById('clearImgBtn');

    if (selectEle.value == "Bank_Transfer") {

        selectImgBtn.disabled = false;        
        clearImgBtn.disabled = false;
       
    } else  {

        selectImgBtn.disabled = true;
        clearImgBtn.disabled = true;

        //clear the image if it was previously uploaded
        payment.trx_proof = null;
        const previewSlipImgEle = document.getElementById('previewSlipImg');
        previewSlipImgEle.src = 'images/slip.png';
        previewSlipImgEle.style.border = "1px solid #ced4da";
        document.getElementById('fileInputSlipPhoto').files = null;

    }
}

//validate and bind
// onchange="imgValidatorSlipPic(this,'payment','trx_proof',previewSlipImg)"
const imgValidatorSlipPic = (fileInputID, object, imgProperty, previewId) => {
    if (fileInputID.files != null) {
        const file = fileInputID.files[0];

        // Validate file size (1 MB max)
        const maxSizeInBytes = 1 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            showAlertModal('war', 'The file size exceeds 1 MB. Please select a smaller file.');
            //return false;
        }

        // Validate file type (JPEG, JPG, PNG)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            showAlertModal('war', "Invalid file type. Only JPEG, JPG, and PNG files are allowed.");
            //return false;
        }

        // Process file and update the preview
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            previewId.src = e.target.result; // Show image preview
            window[object][imgProperty] = btoa(e.target.result); // Store Base64 data
            previewId.style.border = "2px solid lime";
        };
        fileReader.readAsDataURL(file);

        //return true;
    }
    previewId.style.border = "2px solid red";
    return false;
}

//clear uploaded image (not delete)
const clearPayImg = () => {

    if (payment.trx_proof != null) {

        let userConfirmImgDlt = confirm("Are You Sure To Clear This Image?");

        if (userConfirmImgDlt) {
            payment.trx_proof = null;
            const previewSlipImgEle = document.getElementById('previewSlipImg');
            previewSlipImgEle.src = 'images/slip.png';
            document.getElementById('fileInputSlipPhoto').files = null;
            previewSlipImgEle.style.border = "1px solid #ced4da";

        } else {
            showAlertModal("inf", "User Cancelled The Deletion Task")
        }
    }
}

//fn to handle the booking select change event
const handleUserConfirmToRefill = (bookingSelectEle) => {

    //handle if already data is filled
    if ((payment.booking_id && payment.booking_id._id) || payment.paid_amount != null) {
        const userConfirm = confirm("You've already started filling payment details. Changing the booking will reset those values. Do you want to continue?");
        if (!userConfirm) {
            showAlertModal("inf", "User Cancelled The Task");
            return;
        } else {
            // Reset the payment object
            payment.paid_amount = null;
            paymeent.paid_date = null;
            payment.payment_method = null;
            payment.trx_proof = null;

            // Reset the preview image for the payment slip
            const previewSlipImgEle = document.getElementById('previewSlipImg');
            previewSlipImgEle.src = 'images/slip.png';
            previewSlipImgEle.style.border = "1px solid #ced4da";
            document.getElementById('fileInputSlipPhoto').files = null;

            // Reset the form fields
            const inputTagsIds = [
                'inputPaidAmount',
                'inputPaidDate',
                'inputPaymentMethod',
            ];

            inputTagsIds.forEach((fieldID) => {
                const field = document.getElementById(fieldID);
                if (field) {
                    field.style.border = "1px solid #ced4da";
                    field.value = '';
                }
            });

            fillDataByBookinId(bookingSelectEle);
            enableInputs();
        }
    } else {
        fillDataByBookinId(bookingSelectEle);
        enableInputs();
    }
}

//fill booking related inputs
const fillDataByBookinId = (bookingSelectEle) => {

    const rawBookingId = bookingSelectEle.value;
    const bookingValue = JSON.parse(rawBookingId);

    console.log("Selected Booking Value: ", bookingValue);

    if (bookingValue && bookingValue.id) {

        document.getElementById('inputClientName').value = bookingValue.client.fullname || '';
        document.getElementById('inputClientEmail').value = bookingValue.client.email || '';
        document.getElementById('inputClientContact').value = bookingValue.client.contactone || '';
        document.getElementById('inputClientPassport').value = bookingValue.client.passportornic || '';
        document.getElementById('inputTotalAmount').value = bookingValue.final_price.toFixed(2);
        document.getElementById('inputBalanceAmount').value = bookingValue.due_balance.toFixed(2);
        document.getElementById('inputAdvancementAmount').value = bookingValue.advancement_amount.toFixed(2);      

        let fakeArray = [];
        fakeArray.push(bookingValue.tpkg);
        fillMultDataIntoDynamicSelects(selectBookedPackage, 'Please Select Package', fakeArray, 'pkgcode', 'pkgtitle', bookingValue.tpkg.pkgcode);

        payment.booking_id = bookingValue; 

    } else {
        showAlertModal("err", "Selected booking not found.");
    }
};

// enable inputs after booking selection
const enableInputs = () => {
    inputPaidAmount.disabled = false;
    inputPaymentMethod.disabled = false;
    inputPaidDate.disabled = false;
}



// validate paid amount input
const validatePaidAmount = (inputTag) => {
    const value = inputTag.value.trim();
    const num = parseFloat(value);
    const min = 10000;
    const max = parseFloat(document.getElementById('inputBalanceAmount').value) || 0;

    if (value !== "") {
        if (!isNaN(num) && num >= min && num <= max) {
            inputTag.style.border = "2px solid lime";
            payment.paid_amount = num.toFixed(2); // optional: format
        } else {
            inputTag.style.border = "2px solid red";
            payment.paid_amount = null;
            showAlertModal("err", "Paid amount must be between LKR " + min + " and " + max.toFixed(2));
        }
    } else {
        payment.paid_amount = null;
        inputTag.style.border = inputTag.required ? "2px solid red" : "2px solid #ced4da";
    }
};


//check errors before submitting
const checkPayFormErrors = () => {

    let errors = "";

    if (payment.paid_amount == null || payment.paid_amount <= 0) {
        errors += "Please enter a valid paid amount.\n";
    }

    if (!payment.payment_method || payment.payment_method.trim() === '') {
        errors += "Please select a valid payment method.\n";
    }

    //trx_proof is required only for bank transfer
    if (!payment.payment_method || payment.payment_method.trim() === 'Bank_Transfer') {
        if (!payment.trx_proof || payment.trx_proof.trim() === '') {
            errors += "Please upload a valid transaction proof slip image/screnshot.\n";
        }
    }

    if (!payment.paid_date || payment.paid_date.trim() === '') {
        errors += "Please select a valid paid date.\n";
    }

    //if (!payment.pay_status || payment.pay_status.trim() === '') {
    //    errors += "Please select a valid payment status.\n";
    //}

    if (!payment.booking_id || !payment.booking_id.id) {
        errors += "Please select a valid booking.\n";
    }

    return errors;

}

//fn to submit button (add button)
const addNewPayment = async () => {

    const errors = checkPayFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/paymentbyemp", "POST", payment);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formPayment').reset();
                    refreshPaymentForm();
                    buildPaymentTable();
                    var myPayTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myPayTableTab.show();
                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('war', errors);
    }
}

// fill modal fields
const openModal = (paymentObj) => {

    // Pay info
    document.getElementById('modalPayCode').innerText = paymentObj.paymentcode || 'N/A';
    document.getElementById('modalPayAmount').innerText = paymentObj.paid_amount || 'N/A';
    document.getElementById('modalPayDate').innerText = paymentObj.paid_date || 'N/A';
    document.getElementById('modalPayMethod').innerText = paymentObj.payment_method || 'N/A';
    document.getElementById('modalPayBookingCode').innerText = paymentObj.booking_id.bookingcode || 'N/A';

    // Client info
    const relatedClient = paymentObj.booking_id.client || {};

    if (relatedClient) {
        document.getElementById('modalClientName').innerText = relatedClient.fullname || 'N/A';
        document.getElementById('modalClientContact').innerText = relatedClient.contactone || 'N/A';
        document.getElementById('modalClientEmail').innerText = relatedClient.email || 'N/A';
        document.getElementById('modalClientPassport').innerText = relatedClient.passportnumornic || 'N/A';
    }

    // Transaction Proof Image
    if (paymentObj.trx_proof) {
        document.getElementById('modalPayProof').src = atob(paymentObj.trx_proof);
    } else {
        document.getElementById('modalPayProof').src = 'images/slip.png';
    }

    //document.getElementById('modalPayStatus').innerText = paymentObj.status || 'N/A';
    //document.getElementById('modalPayNote').innerText = paymentObj.note || 'N/A';

    // Deleted record handling
    /* if (paymentObj.deleted) {
         document.getElementById('modalIfDeleted').value = 'true';
         document.getElementById('modalPayEditBtn').disabled = true;
         document.getElementById('modalPayDeleteBtn').disabled = true;
         document.getElementById('modalPayEditBtn').classList.add('d-none');
         document.getElementById('modalPayDeleteBtn').classList.add('d-none');
         document.getElementById('modalPayRecoverBtn').classList.remove('d-none');
     } else {
         document.getElementById('modalIfDeleted').value = 'false';
         document.getElementById('modalPayEditBtn').disabled = false;
         document.getElementById('modalPayDeleteBtn').disabled = false;
         document.getElementById('modalPayEditBtn').classList.remove('d-none');
         document.getElementById('modalPayDeleteBtn').classList.remove('d-none');
         document.getElementById('modalPayRecoverBtn').classList.add('d-none');
     }
     */

    window['currentObject'] = paymentObj;

    // Show modal
    $('#infoModalPayment').modal('show');
};



// ***********************search related fns ***************
const getSearchType = (searchSelectEle) => {

    const searchValueEle = document.getElementById("searchValue");

    if (searchSelectEle.value != null) {
        searchSelectEle.style.border = "1px solid lime";
        searchValueEle.disabled = false;
    }
    else {
        searchSelectEle.style.border = "1px solid #ced4da";
        searchValueEle.disabled = true;
        searchValueEle.value = '';
        searchValueEle.style.border = "1px solid #ced4da";
    }
}

//fn for search button
const searchBookings = () => {

    const type = document.getElementById("searchType").value;
    const value = document.getElementById("searchValue").value.trim().toLowerCase();

    if (!type || !value) {
        showAlertModal("err", "Please select a type and enter a value to search.");
        return;
    }

    let filtered = allUnpaidBookings.filter(booking => {

        // Skip bookings without client info
        if (!booking.client) return false;

        let target = "";

        switch (type) {
            case "contact":
                target = booking.client.contactone || "";
                break;
            case "email":
                target = booking.client.email || "";
                break;
            case "nic":
                target = booking.client.passportornic || "";
                break;
            default:
                return false;
        }

        return target.toLowerCase().includes(value);

    });

    console.log("Filtered Bookings: ", filtered);

    const selectBookingEle = document.getElementById("selectBooking");
    fillDataIntoDynamicSelects(selectBookingEle, 'Select Booking', filtered, 'bookingcode');
    selectBookingEle.disabled = false;
    selectBookingEle.style.border = "1px solid orange";

}

//print a recipt
const printPaymentRecord = (paymentObj) => {
    if (!paymentObj) {
        alert('No payment data available to print.');
        return;
    }

    const paymentCode = paymentObj.paymentcode;
    const paidAmount = Number(paymentObj.paid_amount).toFixed(2);
    const paidDate = paymentObj.paid_date;
    const paymentMethod = paymentObj.payment_method;
    const bookingCode = paymentObj.booking_id?.bookingcode;

    const client = paymentObj.booking_id?.client || {};
    const clientName = client.fullname || 'N/A';
    const clientContact = client.contactone || 'N/A';
    const clientEmail = client.email || 'N/A';
    const clientNIC = client.passportornic || 'N/A';

    //const trxProofSrc = paymentObj.trx_proof ? atob(paymentObj.trx_proof) : 'images/slip.png';

    const printableContent = `
    <div class="container-fluid my-3 p-3 border border-dark rounded shadow-sm" style="font-family: Arial, sans-serif; max-width: 800px;">
        <h2 class="text-center text-success mb-4">Payment Receipt</h2>
        <hr class="border border-dark border-2">

        <div class="row mb-3">
            <div class="col-md-6"><strong>Payment Code:</strong> ${paymentCode}</div>
            <div class="col-md-6"><strong>Booking Code:</strong> ${bookingCode}</div>
        </div>

        <div class="row mb-3">
            <div class="col-md-6"><strong>Paid Amount:</strong> LKR ${paidAmount}</div>
            <div class="col-md-6"><strong>Paid Date:</strong> ${paidDate}</div>
        </div>

        <div class="row mb-3">
            <div class="col-md-6"><strong>Payment Method:</strong> ${paymentMethod}</div>
        </div>

        <hr>

        <h5 class="text-primary mb-3">Client Details</h5>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Name:</strong> ${clientName}</div>
            <div class="col-md-6"><strong>Contact:</strong> ${clientContact}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Email:</strong> ${clientEmail}</div>
            <div class="col-md-6"><strong>NIC / Passport:</strong> ${clientNIC}</div>
        </div>
          
        <p class="text-center text-muted small mt-4">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>`;

    const printableTitle = `Receipt_${(paymentCode || 'Payment').replace(/\s+/g, '_')}`;

    const printWindow = window.open('', '', 'width=1000,height=700');
    printWindow.document.write(`
        <html>
        <head>
            <title>${printableTitle}</title>
            <link rel="stylesheet" href="../libs/bootstrap-5.2.3/css/bootstrap.min.css">
            <style>
                body {
                    margin: 0;
                    padding: 10px;
                    background-color: #f8f9fa;
                    font-family: Arial, sans-serif;
                }
                @media print {
                    body {
                        background-color: white;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>${printableContent}</body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    };
};


// validate paid amount input (not used)
const validatePaidAmountLimit = (inputTagId) => {
    const value = inputTagId.value.trim();
    if (value === "") return;

    const numericValue = parseFloat(value);
    const dueBalance = parseFloat(payment.booking_id?.due_balance || 0);

    if (numericValue > dueBalance) {
        inputTagId.style.border = "2px solid red";

        payment.paid_amount = null;
    }
}

// validate paid amount input (not used)
const validatePaidAmountOri = (inputTag) => {
    const pattern = /^(?:[1-9][0-9]{4,})(?:\.[0-9]{1,2})?$/;
    const min = 10000;
    //const max = payment.booking_id.due_balance;
    const max = document.getElementById('inputBalanceAmount').value ? parseFloat(document.getElementById('inputBalanceAmount').value) : 0;

    const value = inputTag.value.trim();

    if (value !== "") {
        const num = parseFloat(value);

        if (pattern.test(value) && num >= min && num <= max) {
            inputTag.style.border = "2px solid lime";
            payment.paid_amount = value;
        } else {
            inputTag.style.border = "2px solid red";
            payment.paid_amount = null;
            showAlertModal("err", "Paid amount cannot exceed the due balance (LKR " + max.toFixed(2) + ").");
        }
    } else {
        payment.paid_amount = null;

        if (inputTag.required) {
            inputTag.style.border = "2px solid red";
        } else {
            inputTag.style.border = "2px solid #ced4da";
        }
    }
};