package lk.yathratravels.tpkg;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lk.yathratravels.dayplan.DayPlan;
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

    @Column(name = "ext_driver_percentage")
    private BigDecimal ext_driver_percentage;

    @Column(name = "ext_vehicle_percentage")
    private BigDecimal ext_vehicle_percentage;

    @Column(name = "ext_guide_percentage")
    private BigDecimal ext_guide_percentage;

    //@Column(name = "addeddatetime")
    //private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    //@Column(name = "addeduserid")
    //private Integer addeduserid;

    @Column(name = "lastmodifieduserid")
    private Integer lastmodifieduserid;

    @Column(name = "pm_status")
    private String pm_status;

    @Column(name = "description")
    private String description;
}
