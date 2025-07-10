const createTable = (tableHolderDivId, uniqueIdOfTable, dataContainer, tableColumnInfoArray,customOpenModal = null) => {

    // Clear out any previous data
    tableHolderDivId.innerHTML = '';

    // Create main table tag
    const tableTag = document.createElement('table');
    tableTag.setAttribute('class', 'table');
    tableTag.setAttribute('id', uniqueIdOfTable);

    // Create thead tag
    const tableHead = document.createElement('thead');
    tableHead.setAttribute('class', 'bg-dark text-white');

    // Create a row for the head
    const tableHeadRow = document.createElement('tr');

    // Add the index column first
    const indexTH = document.createElement('th');
    indexTH.innerText = '#';
    indexTH.setAttribute('class', 'text-center');
    //indexTH.setAttribute('style', 'vertical-align: middle;');
    tableHeadRow.appendChild(indexTH);

    // Add other column headers
    tableColumnInfoArray.forEach(columnObj => {
        const columnHead = document.createElement('th');
        columnHead.innerHTML = columnObj.colHeadName;
        columnHead.setAttribute('class', ('text-center  col-' + columnObj.colHeadName));
        tableHeadRow.appendChild(columnHead);
    });

    // Add the button column last
    const buttonTH = document.createElement('th');
    buttonTH.innerText = 'Action';
    buttonTH.setAttribute('class', 'text-center');
    tableHeadRow.appendChild(buttonTH);

    // Append the row to the thead
    tableHead.appendChild(tableHeadRow);

    // Create tbody
    const tableBody = document.createElement('tbody');

    // Populate tbody with data
    dataContainer.forEach((record, index) => {
        const row = document.createElement('tr');

        // Index column
        const indexCell = document.createElement('td');
        indexCell.innerText = index + 1;
        indexCell.setAttribute('class', 'text-center justify-content-center');
        row.appendChild(indexCell);

        // Data columns
        tableColumnInfoArray.forEach(columnObj => {
            const cell = document.createElement('td');
            cell.setAttribute('class', 'text-center');
            //text-center justify-content-center

            //different scenarios for different display types
            switch (columnObj.displayType) {
                case "text":
                    //employee[0][fullname]
                    cell.innerText = record[columnObj.displayingPropertyOrFn];
                    break;

                case "function":
                    //getDesignation(employee[0])
                    //cell.innerHTML = columnObj.displayingPropertyOrFn(record)
                    //break;

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

                //more cases needed

                default:
                    showAlertModal('err', "error creating table");
                    break;
            }
            row.appendChild(cell);
        });

        // Action button cell in last
        const buttonCell = document.createElement('td');
        buttonCell.setAttribute('class', 'text-center justify-content-center');

        //create a button to insert inside this cell
        const actionButton = document.createElement('button');
        actionButton.setAttribute('class', 'btn-view');
        actionButton.innerText = "View";

        //function for that button ORIGINAL
        //actionButton.onclick = function () {

            //create a global object with the current record's values
            //window['currentObject'] = record;
            // window['currentObjectIndex'] = index;

            //run this function to open a modal with the record's details
            //openModal(record);

        //}

        //custom openModal per each fn
        actionButton.onclick = function () {
            window['currentObject'] = record;
            
            // Use custom modal function if provided, otherwise use global openModal
            if (customOpenModal && typeof customOpenModal === 'function') {
                customOpenModal(record);
            } else {
                openModal(record);
            }
        }

        //append that button to the cell
        buttonCell.appendChild(actionButton);

        //append that cell to the row
        row.appendChild(buttonCell);

        tableBody.appendChild(row);
    });

    // Append thead and tbody to the table
    tableTag.appendChild(tableHead);
    tableTag.appendChild(tableBody);

    // Append the table to the holder div
    tableHolderDivId.appendChild(tableTag);
};
