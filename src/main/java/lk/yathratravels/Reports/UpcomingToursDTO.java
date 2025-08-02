package lk.yathratravels.Reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

//USED IN BOOKING DAO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingToursDTO {

    private String bookingCode;
    private String packageTitle;
    private String clientName;
    private String clientContact;
 
}

 //public UpcomingToursDTO(String bookingCode, String packageTitle, String clientName, String clientContact) {
    //    this.bookingCode = bookingCode;
    //    this.packageTitle = packageTitle;
    //    this.clientName = clientName;
    //    this.clientContact = clientContact;
    //}
