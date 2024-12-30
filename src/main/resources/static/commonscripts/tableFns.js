//create first row(thead) with ths
//use an array of objects , enhance the same displayProperty array(dataType,propertyName, add a new called table head name)

//populate data in them

const createTable = (tableId, dataContainer, tableColumnInfoArray) => {

    //create empty thead
    const tableHead = document.createElement('thead');
    tableHead.innerHTML = "";
    tableHead.setAttribute('class', 'table-primary');

    //create index column separately
    const indexTH = document.createElement('th');
    indexTH.innerText = "#";
    tableHead.appendChild(indexTH);

    //create first row (trs set)
    tableColumnInfoArray.forEach(columnObj => {
        const columnHead = document.createElement('th');
        columnHead.innerText = columnObj.colHeadName;
        //awul giyoth inner () ayn karanna, yathra.js openReusableModalForCardsReadMore
        columnHead.setAttribute('class', ('col-' + columnObj.colHeadName));

        //append to thead tag
        tableHead.appendChild(columnHead);
    });

    //create empty tbody
    const tableBody = document.createElement('tbody');
    tableBody.innerHTML = "";

    //populate tbody with data (other rows & cells )
    // one row per record
    dataContainer.forEach((record, index) => {

        //create empty row
        const tr = document.createElement('tr');

        //create and fill first td cell(index) separately
        const indexCell = document.createElement('td');
        indexCell.innerText = index + 1;
        tr.appendChild(indexCell);

        //create and fill other td cells 
        tableColumnInfoArray.forEach((columnObj) => {

            const td = document.createElement('td');
            td.setAttribute('class', 'text-center,justify-content-center');

            //different scenarios for different display types
            switch (columnObj.displayType) {
                case "text":
                    //employee[0][fullname]
                    td.innerText = record[columnObj.displayingValOrFn];
                    break;

                case "function":
                    //getDesignation(employee[0])
                    td.innerHTML = columnObj.displayingValOrFn(record)
                    break;

                //more cases needed

                default:
                    alert("error creating table");
                    break;
            }

            tr.appendChild(td);
        });

        //action 
        tr.ondblclick = function () {
            console.log("row clicked " + indexCell + 1);
        }

    })

    //append tr to tbody
    tableBody.appendChild(tr);

    //append thead to table
    tableId.appendChild(tableHead);

    //append tbody to table
    tableId.appendChild(tableBody);

}