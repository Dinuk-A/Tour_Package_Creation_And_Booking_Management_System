package lk.yathratravels.tpkg;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.math.BigDecimal;
import java.util.List;

public interface PriceModsDao extends JpaRepository<PriceMods, Integer> {
    // ✅ Get the most recent (latest) active surcharge config (e.g., status =
    // 'ACTIVE')
    // @Query("SELECT p FROM PriceMods p WHERE p.ext_fee_status = 'ACTIVE' ORDER BY
    // p.lastmodifieddatetime DESC")
    // Optional<PriceMods> getLatestActiveModifiers();

    @Query(value = "SELECT * FROM price_modifiers ORDER BY id DESC LIMIT 1", nativeQuery = true)
    PriceMods findLatestEntry();

    // from spring
    // PriceMods findTopByOrderByIdDesc();

    @Query(value = "SELECT company_profit_margin FROM price_modifiers LIMIT 1", nativeQuery = true)
    BigDecimal getCompanyProfitMargin();

}
