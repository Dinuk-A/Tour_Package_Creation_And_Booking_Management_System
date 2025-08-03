window.addEventListener('load', () => {
    
    fetchPaySumForAllMonths();

});

//global array
let paySumsArray = [];

const fetchPaySumForMonth = async (id) => {
    try {
        //get data by ajax
        const receivedAmountVar = await ajaxGetReq("paysum/bymonth?monthId=" + id);
        console.log("recieved Data: ", receivedAmountVar);
        paySumsArray.push(receivedAmountVar);
        console.log("new paySumsArray", paySumsArray);
        fillDataIntoTableViva();

    } catch (error) {
        console.error("Error fetching payment data:", error);
    }

}

//for table common fn
const fetchPaySumForAllMonths = async () => {

    const monthIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];  

    monthIds.forEach((id) => {

        fetchPaySumForMonth(id);
       
    })

    //fillDataIntoTableViva();
}

const fillDataIntoTableViva =()=>{
    const tableElement = document.getElementById('paymentReportVivaTable');
    const jan = document.getElementById('receivedAmountJan');
    const feb = document.getElementById('receivedAmountFeb');
    const mar = document.getElementById('receivedAmountMar');
    const apr = document.getElementById('receivedAmountApr');
    const may = document.getElementById('receivedAmountMay');
    const june = document.getElementById('receivedAmountjune');
    const july = document.getElementById('receivedAmountJuly');
    const aug = document.getElementById('receivedAmountAug');
    const sep = document.getElementById('receivedAmountSep');
    const oct = document.getElementById('receivedAmountOct');
    const nov = document.getElementById('receivedAmountNov');
    const dec = document.getElementById('receivedAmountDec');

    jan.innerText = paySumsArray[0];
    feb.innerText = paySumsArray[1];
    mar.innerText = paySumsArray[2];
    apr.innerText = paySumsArray[3];
    may.innerText = paySumsArray[4];
    june.innerText = paySumsArray[5];
    july.innerText = paySumsArray[6];
    aug.innerText = paySumsArray[7];
    sep.innerText = paySumsArray[8];
    oct.innerText = paySumsArray[9];
    nov.innerText = paySumsArray[10];
    dec.innerText = paySumsArray[11];
    

    //document.getElementById('receivedAmountJan').innerText = paySumsArray[0];
}







//get pay sum for jan ...test
//const fetchPaySumForAug = async () => {
//    try {
//        //get data by ajax
//        const receivedAmountVar = await ajaxGetReq("paysum/bymonth?monthId=" + 8);
//        console.log("recieved Data: ", receivedAmountVar);
//
//    } catch (error) {
//        console.error("Error fetching payment data:", error);
//    }
//
//}