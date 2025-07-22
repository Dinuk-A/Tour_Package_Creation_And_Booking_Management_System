//for handle GET method (form submissions)
const ajaxGetReq = (url) => {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("GET success for " + url);
                resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("GET failed for " + url);
                reject({ jqXHR, textStatus, errorThrown });
            }
        });
    });
}

//for POST/PUT/DELETE methods (data operations)
const ajaxPPDRequest = (url, method, object) => {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: method,
            data: JSON.stringify(object),
            contentType: "application/json",
            success: function (data) {
                console.log(method + " success for " + url);
                resolve(data);
            },
            error: function (response) {
                console.error(method + " failed for " + url);
                reject(response);
            }
        });
    });
}

function openNav() {
    var sidebar = document.getElementById("dashboardSidebarID");
    var mainArea = document.getElementById("mainAreaID");

    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        sidebar.style.width = "0px";
        mainArea.style.marginLeft = "0px";
    } else {
        sidebar.classList.add("open");
        sidebar.style.width = "300px";
        // mainArea.style.marginLeft = "300px"; 
        mainArea.setAttribute('style', 'margin-left: 300px;')
    }
}

//insert 2 decimal 0s at the end of every price input field
const insertDecimals = (elementId) => {

    let enteredValue = parseFloat(elementId.value);

    // Check if the value is a valid number and update with .00 if not already there
    if (!isNaN(enteredValue)) {
        elementId.value = enteredValue.toFixed(2);
    }
}

// common debounce to delay the execution of a function    
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/*Array.from(select.options).map((opt, index) => {
    opt.hidden = index > 1; // Hide all except first two
});
*/

//control sidebar elements visibility by logged user role
function controlSidebarLinks() {

    const raw = document.getElementById("userRolesArraySection").textContent;
    const userRoles = JSON.parse(raw);

    const show = (id) => document.getElementById(id).classList.remove("d-none");
    const hide = (id) => document.getElementById(id).classList.add("d-none");

    if (userRoles.includes("System_Admin") || userRoles.includes("Manager")) {
        show("employeeManagementLink");
        show("successInquiryReportLink");
        show("paymentReportLink");
    } else {
        hide("employeeManagementLink");
        hide("successInquiryReportLink");
        hide("paymentReportLink");
    }

    if (userRoles.includes("System_Admin")) {
        show("userAccountManagementLink");
        show("privilegeManagementLink");
    } else {
        hide("userAccountManagementLink");
        hide("privilegeManagementLink");
    }

    if (userRoles.includes("System_Admin") || userRoles.includes("Manager") || userRoles.includes("Assistant Manager")) {
        show("priceConfigsLink");
    } else {
        hide("priceConfigsLink");
    }

    const commonRoles = ["System_Admin", "Manager", "Assistant Manager", "Executive"];
    if (userRoles.some(role => commonRoles.includes(role))) {
        show("vehicleManagementLink");
        show("restaurantManagementLink");
        show("accommodationManagementLink");
        show("destinationManagementLink");
        show("itineraryBuilderLink");
        show("tourPackageBuilderLink");
        show("inquiryManagementLink");
        show("clientManagementLink");
        show("bookingManagementLink");
        show("paymentManagementLink");
        show("expensesManagementLink");
    } else {
        hide("vehicleManagementLink");
        hide("restaurantManagementLink");
        hide("accommodationManagementLink");
        hide("destinationManagementLink");
        hide("itineraryBuilderLink");
        hide("tourPackageBuilderLink");
        hide("inquiryManagementLink");
        hide("clientManagementLink");
        hide("bookingManagementLink");
        hide("paymentManagementLink");
        hide("expensesManagementLink");
    }
}

