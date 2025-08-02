window.addEventListener('load', () => {

    //load date pickers when page is loading
    const today = new Date().toISOString().split('T')[0];
    const startDatePicker = document.getElementById('startDatePickerID');
    const endDatePicker = document.getElementById('endDatePickerID');

    // set max attributes for the date pickers
    startDatePicker.setAttribute('max', today);
    endDatePicker.setAttribute('max', today);

    // reset the end date to today's date each time the start day changes
    startDatePicker.addEventListener('change', function () {
        const startDateValue = this.value;
        endDatePicker.value = today;
        endDatePicker.setAttribute('min', startDateValue);
    });

    // end date cannot go earlier than start date
    endDatePicker.addEventListener('change', function () {
        const endDateValue = this.value;
        const startDateValue = startDatePicker.value;
        if (endDateValue < startDateValue) {
            alert('End date cannot be earlier than start date.');
            this.value = '';
        }
    });

});

const fillTable = async () => {
    const startDate = startDatePickerID.value;
    const lastDate = endDatePickerID.value;

    if (startDate && lastDate) {

        // Show the table
        document.getElementById('inquiryTable').classList.remove('d-none');

        //fill date range row
        const formattedDateRangeText = `${new Date(startDate).toLocaleDateString()} - ${new Date(lastDate).toLocaleDateString()}`;
        document.getElementById('dateRange').innerText = formattedDateRangeText;

        let allInqs = 0;
        let successInqs = 0;

        try {
            //get all inqs
            allInqs = await ajaxGetReq("report/allinqsbygivendate/" + startDate + "/" + lastDate)
            totalInquiries.innerText = allInqs;
        } catch (error) {
            console.error("Error fetching all inquiries:", error);
            alert("Failed to load inquiries. Please try again later.");
        }

        try {
            //get success inqs
            successInqs = await ajaxGetReq("report/confirmedinqs/" + startDate + "/" + lastDate)
            successfulInquiries.innerText = successInqs;
        } catch (error) {
            console.error("Error fetching successful inquiries:", error);
            alert("Failed to load confirmed inquiries. Please try again later.");
        }

        let successRate;
        if (allInqs == 0) {
            successRate = 'N/A';
        } else if (successInqs == 0) {
            successRate = '0.00%';
        } else {
            successRate = ((successInqs / allInqs) * 100).toFixed(2) + '%';
        }
        successRateId.innerText = successRate;

    } else {
        showAlertModal('war','Please select both start date and end date.');
    }
}

