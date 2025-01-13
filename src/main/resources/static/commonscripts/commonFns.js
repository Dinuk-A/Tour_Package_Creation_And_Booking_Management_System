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
};
