package lk.yathratravels.Reports;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.yathratravels.payment.Payment;

public interface PaymentReportsDao extends JpaRepository<Payment, Integer> {

    // Get the total payment sum between two dates
    @Query(value = "SELECT sum(p.paid_amount) FROM newyathra.payment as p where p.paid_date between ?1 and ?2 ;", nativeQuery = true)
    public BigDecimal findTotalPaidAmountByDateRange(LocalDate startDate, LocalDate endDate);

    //FOR MODIFICATION
    @Query(value = "select sum(pay.paid_amount) from newyathra.payment as pay where month(pay.paid_date)=?1",nativeQuery = true)
    public BigDecimal findPaySumByMonth(Integer monthId);

    
}
