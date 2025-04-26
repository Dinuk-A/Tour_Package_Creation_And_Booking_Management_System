//for get method
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

//for other 3 methods
const ajaxPPDRequest = (url, method, object) => {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: method,
            data: JSON.stringify(object),
            contentType: "application/json",
            success: function (data) {
                console.log(method + " success for " + url);
                resolve(data);  // Resolve the promise with the response data
            },
            error: function (response) {
                console.error(method + " failed for " + url);
                reject(response);  // Reject the promise with the error response
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
