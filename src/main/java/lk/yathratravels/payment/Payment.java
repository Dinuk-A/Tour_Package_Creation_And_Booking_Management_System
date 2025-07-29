package lk.yathratravels.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.yathratravels.bookings.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "paymentcode")
    private String paymentcode;

    @Column(name = "payingamount")
    private BigDecimal payingamount;

    @Column(name = "note")
    private String note;

    @Column(name = "payment_method")
    private String payment_method;

    @Column(name = "payment_date")
    private LocalDate payment_date;

    // pay slip or ss
    @Column(name = "trx_proof")
    private byte[] trx_proof; 

    @Column(name = "pay_status")
    private String pay_status;

    // to which particular booking do we make this payment
    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking_id;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

}


