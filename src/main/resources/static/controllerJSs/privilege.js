window.addEventListener('load', () => {

    loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/PRIVILEGE");

    //call fn for refresh privilege table
    refreshPrvTbl();

    //call a fn for-refresh privilege form
    refreshPrivilegeForm();

})

//define fn for refresh privilege table
const refreshPrvTbl = () => {

    permissions = ajaxGetRequest("/privilege/alldata");


    const displayProperty = [
        { dataType: 'function', propertyName: getRoles },
        { dataType: 'function', propertyName: getModule },
        { dataType: 'function', propertyName: getSelect },
        { dataType: 'function', propertyName: getInsert },
        { dataType: 'function', propertyName: getUpdate },
        { dataType: 'function', propertyName: getDelete }
    ]

    fillDataIntoTable3(privilegeTable, permissions, displayProperty, buttonVisibility = true, loggedUserPrivileges)

    //call the new datatable format(from net)
    $('#privilegeTable').dataTable();
}

const getRoles = (ob) => {
    return ob.role.name;
}

const getModule = (ob) => {
    return ob.module.name;
}

const getSelect = (ob) => {
    if (ob.privselect) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getInsert = (ob) => {
    if (ob.privinsert) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getUpdate = (ob) => {
    if (ob.privupdate) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getDelete = (ob) => {
    if (ob.privdelete) {
        return "✅"
    } else {
        return "🟥"
    }
}

//define a fn for refresh privi form
const refreshPrivilegeForm = () => {

    privilege = new Object;

    formPrivilege.reset();

    //get ROLES list for select element
    roles = ajaxGetRequest("role/alldata");
    fillDataIntoSelect(selectRole, 'Please Select The Role', roles, 'name');
    selectRole.disabled = false;

    //get MODULES list for select element
    modules = ajaxGetRequest("module/alldata");
    fillDataIntoSelect(selectModule, 'Please Select The Module', modules, 'name');
    selectModule.disabled = false;

    selectRole.style.border = "1px solid #ced4da"
    selectModule.style.border = "1px solid #ced4da"

    privilege.privselect = false;
    privilege.privinsert = false;
    privilege.privupdate = false;
    privilege.privdelete = false;

    labelSel.innerHTML = "  <div class='text-danger '>Not Granted </div>";
    labelInsert.innerHTML = " <div class='text-danger'>Not Granted </div> ";
    labelUpdate.innerHTML = " <div class='text-danger'>Not Granted </div> ";
    labelDelete.innerHTML = " <div class='text-danger'>Not Granted </div> ";

    priviUpdateBtn.disabled = true;
    priviUpdateBtn.style.cursor = "not-allowed";

}

//for filter
// const getModulesnRolesFilter = () => {

//     let selectedRole = false;
//     let selectedModule = false;

//     if (selectRoleForFilter.value != '') {
//         selectedRole = true;
//     }

//     if (selectModuleForFilter.value != '') {
//         selectedModule = true;
//     }

//     const getModulesnRolesFilter= permissions.filter((privi)=>{
//         let role;
//         let module;

//         const roleValue = JSON.parse(selectRoleForFilter.value).id;
//         role = privi.role.id;
//     })



// }



//create checkbox validator function 
const checkPrivi = (feildId, object, property, trueValue, falseValue,
    labelId, prvType) => {

    if (feildId.checked) {
        window[object][property] = trueValue;
        labelId.innerHTML = prvType + ' Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        window[object][property] = falseValue;
        labelId.innerHTML = prvType + ' Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }
}

/*create checkbox validator function 
 const checkPrivi = (feildId,pattern,object,property,trueValue,falseValue,
                        labelId,labelTrueValue,labelFalseValue) => {

   if (feildId.checked) {
    window[object][property] = trueValue;
    labelId.innerHTML = labelTrueValue;
   } else {
    window[object][property] = falseValue;
    labelId.innerHTML = labelFalseValue;
   }
}*/

//filter module list by given role
const generateModuleList = () => {

    modulesByRole = ajaxGetRequest("/module/listbyrole?roleid=" + JSON.parse(selectRole.value).id);

    fillDataIntoSelect(selectModule, 'Please Select Module', modulesByRole, 'name');
    selectModule.disabled = false;
}

//fn for update button
const updatePrivilege = () => {
    console.log("Update btn clicked");
    console.log(privilege);
    console.log(oldPrivOb);

    //check errors
    let errors = checkFormError();
    if (errors == "") {
        //check available update 
        let updates = checkFormUpdate();
        if (updates == "") {
            alert("Nothing Updated..!");
        } else {
            //get user confirmation
            let userConfirm = confirm("Are you sure to update following record? \n" + updates);

            if (userConfirm) {
                //call put service
                let putServiceResponce;

                $.ajax("/privilege", {
                    type: "PUT",
                    contentType: "application/json",
                    async: false,
                    data: JSON.stringify(privilege),
                    success: function (data) {
                        putServiceResponce = data;
                    },

                    error: function (resData) {
                        putServiceResponce = resData;
                    }
                });

                if (putServiceResponce == "OK") {
                    alert("Update Successfully!");
                    refreshPrvTbl();
                    formPrivilege.reset();
                    $('#offcanvasPrv').offcanvas('hide');
                    refreshPrivilegeForm();

                } else {
                    alert("Form content failure \n" + putServiceResponce);
                }
            }

        }


    } else {
        alert("Form has some errors... please check the form again..\n" + errors);
    }
}

//fn for add button
const addPrivilege = () => {
    console.log("form ADD button clicked");

    //chech form errors
    let errors = checkFormError();

    if (errors == '') {
        const userConfirm = confirm("are you sure to grant following permissions ? \n" + privilege.module.name)

        if (userConfirm) {
            //call POST service
            let postServiceResponse;

            // ajaxRequest("/privilege", "POST", "privilege"); meka waradiy

            $.ajax("/privilege", {
                type: "POST",
                async: false,
                contentType: "application/json",
                data: JSON.stringify(privilege),
                success: function (data) {
                    console.log(data + " success");
                    postServiceResponse = data;
                },
                error: function (resOb) {
                    console.log("failed " + resOb);
                    postServiceResponse
                }
            });

            if (postServiceResponse == "OK") {
                console.log("add btn working fine");
                alert("Saved ");
                formPrivilege.reset();
                refreshPrvTbl();
                refreshPrivilegeForm(); //mekay
                //mekay 2ma thiyenna one ???
                //eth 2nd time ekedi refresh wenne na
                $('#offcanvasPrv').offcanvas('hide');

            }
        } else {
            alert("user cancelled the task")
        }


    } else {
        alert("form has following errors \n " + errors)
    }


}

//for EDIT btn FOR REFILL
const editPriv = (rowOb, rowInd) => {

    console.log('edit button clicked');

    $('#offcanvasPrv').offcanvas('show');

    privilege = JSON.parse(JSON.stringify(rowOb));
    oldPrivOb = JSON.parse(JSON.stringify(rowOb));

    roles = ajaxGetRequest("role/alldata");
    fillDataIntoSelect(selectRole, 'Please Select The Role', roles, 'name', rowOb.role.name);
    selectRole.disabled = false;

    modules = ajaxGetRequest("module/alldata");
    fillDataIntoSelect(selectModule, 'Please Select The Module', modules, 'name', rowOb.module.name);
    selectModule.disabled = false;

    if (rowOb.privselect) {
        selectSwitch.checked = true;
        labelSel.innerHTML = 'Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        selectSwitch.checked = false;
        labelSel.innerHTML = 'Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }

    if (rowOb.privinsert) {
        insertSwitch.checked = true;
        labelInsert.innerHTML = 'Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        insertSwitch.checked = false;
        labelInsert.innerHTML = 'Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }

    if (rowOb.privupdate) {
        updateSwitch.checked = true;
        labelUpdate.innerHTML = 'Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        updateSwitch.checked = false;
        labelUpdate.innerHTML = 'Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }

    if (rowOb.privdelete) {
        deleteSwitch.checked = true;
        labelDelete.innerHTML = 'Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        deleteSwitch.checked = false;
        labelDelete.innerHTML = 'Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }

    priviUpdateBtn.disabled = false;
    priviUpdateBtn.style.cursor = "pointer";

    priviAddBtn.disabled = true;
    priviAddBtn.style.cursor = "not-allowed";


}

//fn for DELETE btn
const deletePrivi = (ob, rowInd) => {
    console.log('delete btn clicked');

    //row eka colour wenne na
    //privilegeTable.children[1].children[rowInd].style.backgroundColor = 'red';

    setTimeout(function () {
        const userConfirm = confirm('You sure ?');

        if (userConfirm) {
            let deleteServerResponse;

            // ajaxRequest("/privilege" , "DELETE" , ob)

            $.ajax("/privilege", {
                type: "DELETE",
                async: false,
                contentType: "application/json",
                data: JSON.stringify(ob),
                success: function (data) {
                    console.log(data + " success");
                    deleteServerResponse = data;
                },
                error: function (resOb) {
                    console.log("failed " + resOb);
                    deleteServerResponse
                }
            });
            if (deleteServerResponse == "OK") {
                alert("delete success");
                refreshPrvTbl();
            } else {
                alert("have errors " + deleteServerResponse);
            }

        }

    }, 500);
}


const printPrivi = () => { }

//define fn ckeckerror
const checkFormError = () => {

    let errors = '';

    if (privilege.role == null) {
        errors = errors + "Please select the ROLE  \n";
        //textName.style.background = 'rgba(255,0,0,0.1)';
    }
    if (privilege.module == null) {
        errors = errors + "Please select the MODULE \n";
    }
    if (privilege.privselect == null) {
        errors = errors + "Please select 'SELECT' privilege  \n";
    }
    if (privilege.privinsert == null) {
        errors = errors + "Please select 'INSERT' privilege  \n";
    }
    if (privilege.privupdate == null) {
        errors = errors + "Please select 'UPDATE' privilege \n";
    }
    if (privilege.privdelete == null) {
        errors = errors + "Please select 'DELETE' privilege  \n";
    }

    //meka waradi
    // if (employee.propertyName==null){
    //     errors = errors + "full name cant be empty \n";
    // }

    return errors;
}

//fn for compare and check updated values
const checkFormUpdate = () => {
    let updates = '';

    if (privilege.role.name != oldPrivOb.role.name) {
        updates = updates + " Role changed \n";
    }

    if (privilege.module.name != oldPrivOb.module.name) {
        updates = updates + " Module changed \n";
    }

    if (privilege.privselect != oldPrivOb.privselect) {
        updates = updates + "SELECT privilege is changed \n";
    }

    if (privilege.privinsert != oldPrivOb.privinsert) {
        updates = updates + "INSERT privilege is changed \n";
    }

    if (privilege.privupdate != oldPrivOb.privupdate) {
        updates = updates + "UPDATE privilege is changed \n";
    }

    if (privilege.privdelete != oldPrivOb.privdelete) {
        updates = updates + "DELETE privilege is changed \n";
    }

    return updates;
}

