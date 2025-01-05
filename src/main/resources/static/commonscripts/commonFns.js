//fn for AJAX get reqs
const ajaxGetReq = (url) => {

    let responseOfGet;

    $.ajax(url, {
        type: "GET",
        contentType: "json",
        async: false,

        success: function (data) {

            console.log("GET success");
            console.log(url + " " + data);
            responseOfGet = data;

        },

        error: function (response) {

            console.log("GET failed");
            console.log(url + " " + response);
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
            console.log(method + " success");
            console.log(url + data);
            responseOfMethod = data;
        },

        error: function (response) {
            console.log(response);
            responseOfMethod = response;
        }

    })

    return responseOfMethod;
}