window.addEventListener('load', () => {

    // Load date pickers when the page is loading
    const today = new Date().toISOString().split('T')[0];
    const startDatePicker = document.getElementById('startDatePickerID');
    const endDatePicker = document.getElementById('endDatePickerID');

    // Set max attributes for the date pickers
    startDatePicker.setAttribute('max', today);
    endDatePicker.setAttribute('max', today);

    // Reset the end date to today's date each time the start day changes
    startDatePicker.addEventListener('change', function () {
        const startDateValue = this.value;
        endDatePicker.value = today;
        endDatePicker.setAttribute('min', startDateValue);
    });

    // End date cannot go earlier than start date
    endDatePicker.addEventListener('change', function () {
        const endDateValue = this.value;
        const startDateValue = startDatePicker.value;
        if (endDateValue < startDateValue) {
            alert('End date cannot be earlier than start date.');
            this.value = '';
        }
    });

    // Generate report button click event
    document.getElementById('generateReportBtn').addEventListener('click', fillTable);
});

// Function to fill the table with the report data
const fillTable = async () => {
    const startDate = startDatePickerID.value;
    const lastDate = endDatePickerID.value;

    if (startDate && lastDate) {

        // Show the table
        document.getElementById('paymentReportTable').classList.remove('d-none');

        // Fill date range row
        const formattedDateRangeText = `${new Date(startDate).toLocaleDateString()} to ${new Date(lastDate).toLocaleDateString()}`;
        document.getElementById('dateRange').innerText = formattedDateRangeText;

        try {
            //get data by ajax
            const receivedAmountVar = await ajaxGetReq ("report/sumofpayments/" + startDate + "/" + lastDate);
            document.getElementById('receivedAmount').innerText = receivedAmountVar;

        } catch (error) {
            console.error("Error fetching payment data:", error);
        }


    } else {
        alert('Please select both start date and end date.');
    }
}

