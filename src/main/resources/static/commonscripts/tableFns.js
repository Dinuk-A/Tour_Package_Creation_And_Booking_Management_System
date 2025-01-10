//create first row(thead) with ths
//use an array of objects , enhance the same displayProperty array(dataType,propertyName, add a new called table head name)

//populate data in them

// Add an explicit column for the index in tableColumnInfoArray
const createTable = (tableHolderDivId, uniqueIdOfTable, dataContainer, tableColumnInfoArray) => {

    // Clear out any previous data
    tableHolderDivId.innerHTML = '';

    // Create main table tag
    const tableTag = document.createElement('table');
    tableTag.setAttribute('class', 'table table-bordered table-striped border-primary mt-2 mb-2');
    tableTag.setAttribute('id', uniqueIdOfTable);

    // Create thead
    const tableHead = document.createElement('thead');

    // Create a row for the head
    const tableHeadRow = document.createElement('tr');

    // Add the index column first
    const indexTH = document.createElement('th');
    indexTH.innerText = '#';
    tableHeadRow.appendChild(indexTH);

    // Add other column headers
    tableColumnInfoArray.forEach(columnObj => {
        const columnHead = document.createElement('th');
        columnHead.innerText = columnObj.colHeadName;
        columnHead.setAttribute('class', ('text-center justify-content-center col-head col-' + columnObj.colHeadName));
        tableHeadRow.appendChild(columnHead);
    });

    // Add the button column last
    const buttonTH = document.createElement('th');
    buttonTH.innerText = 'Action';
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
            cell.setAttribute('class', 'text-center justify-content-center');

            //different scenarios for different display types
            switch (columnObj.displayType) {
                case "text":
                    //employee[0][fullname]
                    cell.innerText = record[columnObj.displayingPropertyOrFn];
                    break;

                case "function":
                    //getDesignation(employee[0])
                    cell.innerHTML = columnObj.displayingPropertyOrFn(record)
                    break;

                //more cases needed

                default:
                    alert("error creating table");
                    break;
            }
            row.appendChild(cell);
        });

        // Action button cell in last
        const buttonCell = document.createElement('td');
        buttonCell.setAttribute('class', 'text-center justify-content-center');

        //create a button to insert inside this cell
        const actionButton = document.createElement('button');
        actionButton.setAttribute('class', 'btn btn-primary');
        actionButton.innerText = "View";

        //function for that button
        actionButton.onclick = function () {
            //create a public object with the current record's values
            window['currentObject'] = record;
            // window['currentObjectIndex'] = index;

            //mekedima aluth modal eka open wenna one, test
            openModal(record);
            //open modal ekata wena wenama function liyanna wenawa wena wena js wala

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
