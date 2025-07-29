package lk.yathratravels.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PaymentDao extends JpaRepository<Payment, Integer> {

    // create next paymrntcode
    @Query(value = "select concat('TRX', lpad(substring(max(paymentcode),4)+1, 5, 0)) as paymentcode from newyathra.payment as pmnt;", nativeQuery = true)
    public String getNextPaymentCode();

}
