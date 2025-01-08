//fn for AJAX get reqs
const ajaxGetReq = (url) => {

    let responseOfGet;

    $.ajax(url, {
        type: "GET",
        contentType: "json",
        async: false,

        success: function (data) {

            console.log("GET success for " + url);

            //store recieved data
            responseOfGet = data;

        },

        error: function (jqXHR, textStatus, errorThrown) {

            console.error("GET failed for " + url);
            // console.error("Server Response" + response);
            console.error('Status:', jqXHR.status);
            console.error('Status Text:', jqXHR.statusText);
            console.error('Text Status:', textStatus);
            console.error('Error Thrown:', errorThrown);

            // make the response empty because nothing returned
            responseOfGet = [];

        }

    })

    return responseOfGet;
}

//fn for AJAX post/put/delete services
const ajaxRequest = (url, method, object) => {

    let responseOfMethod;

    $.ajax(url, {
        type: method,
        data: JSON.stringify(object),
        contentType: "application/json",
        async: false,

        success: function (data) {
            console.log(method + " success for " + url);
            responseOfMethod = data;
        },

        error: function (response) {
            console.log(response);
            console.error(method + " failed for " + url);
            responseOfMethod = response;
        }

    })

    return responseOfMethod;
}

//by gpt
const newGetReq = (url) => {
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

//by gpt
const ajaxRequestNew = (url, method, object) => {
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
