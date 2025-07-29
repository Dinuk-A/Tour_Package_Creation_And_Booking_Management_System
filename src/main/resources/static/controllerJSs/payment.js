window.addEventListener('load', () => {

    buildPaymentTable();
    refreshPaymentForm();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
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

    if (payObj && payObj.paying_amount) {
        return `LKR ${payObj.paying_amount.toFixed(2)}`;
    }

}

// to support the table creation
const showRelatedBookingCode = (payObj) => {
    //booking_id.bookingcode
    if (payObj && payObj.booking_id && payObj.booking_id.bookingcode) {
        return payObj.booking_id.bookingcode;
    }
    return '';
}

// to support the table creation
const showClientName = (payObj) => {
    //booking_id.tpkg.basedinq.clientname
    if (payObj && payObj.booking_id && payObj.booking_id.tpkg && payObj.booking_id.tpkg.basedinq && payObj.booking_id.tpkg.basedinq.clientname) {
        return payObj.booking_id.tpkg.basedinq.clientname;
    }
    return '';
}

// refreshes the payment form
const refreshPaymentForm = async () => {

    payment = new Object();
    document.getElementById('formPayment').reset();

    try {
        const allUnpaidBookings = await ajaxGetReq("/booking/unpaid")
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
        'inputPaidAmount',
        'inputPaymentMethod',
        'inputPaidDate',
        'selectPaymentStatus',
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

//  a fn to restrict choosing future dates than today 
const restrictFutureDates = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputPaidDate').setAttribute('max', today);
};

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
const clearEmpImg = () => {

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

//check errors before submitting
const checkPayFormErrors = () => {

    let errors = "";

    if (payment.paid_amount == null || payment.paid_amount <= 0) {
        errors += "Please enter a valid paid amount.\n";
    }

    if (!payment.payment_method || payment.payment_method.trim() === '') {
        errors += "Please select a valid payment method.\n";
    }

    if (!payment.paid_date || payment.paid_date.trim() === '') {
        errors += "Please select a valid paid date.\n";
    }

    if (!payment.pay_status || payment.pay_status.trim() === '') {
        errors += "Please select a valid payment status.\n";
    }

    if (!payment.booking_id || !payment.booking_id._id) {
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
                const postServerResponse = await ajaxPPDRequest("/payment", "POST", payment);

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
    const relatedInquiry = paymentObj.booking_id.tpkg.basedinq || {};

    if (relatedInquiry) {
        document.getElementById('modalClientName').innerText = relatedInquiry.clientname || 'N/A';
        document.getElementById('modalClientContact').innerText = relatedInquiry.contactnum || 'N/A';
        document.getElementById('modalClientEmail').innerText = relatedInquiry.email || 'N/A';
        document.getElementById('modalClientPassport').innerText = relatedInquiry.passportnumornic || 'N/A';
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

    //window['currentPayment'] = paymentObj;

    // Show modal
    $('#infoModalPayment').modal('show');
};

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshPaymentForm();
        }
    });
});
