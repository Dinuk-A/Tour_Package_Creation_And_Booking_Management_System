package lk.yathratravels.tpkg;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "price_modifiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceMods {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "company_profit_margin")
    private BigDecimal company_profit_margin;

    // @Column(name = "ext_driver_percentage")
    // private BigDecimal ext_driver_percentage;
    //
    // @Column(name = "ext_vehicle_percentage")
    // private BigDecimal ext_vehicle_percentage;
    //
    // @Column(name = "ext_guide_percentage")
    // private BigDecimal ext_guide_percentage;

    @Column(name = "ext_driver_daily_charge")
    private BigDecimal ext_driver_daily_charge;

    @Column(name = "ext_guide_daily_charge")
    private BigDecimal ext_guide_daily_charge;

    @Column(name = "int_driver_daily_cost")
    private BigDecimal int_driver_daily_cost;

    @Column(name = "int_guide_daily_cost")
    private BigDecimal int_guide_daily_cost;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @Column(name = "updateddatetime")
    private LocalDateTime updateddatetime;

    @Column(name = "updateduserid")
    private Integer updateduserid;

    @Column(name = "description")
    private String description;
}
