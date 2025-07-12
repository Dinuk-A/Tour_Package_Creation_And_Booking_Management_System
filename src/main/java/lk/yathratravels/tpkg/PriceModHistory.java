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
@Table(name = "price_mod_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceModHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "old_cpm")
    private BigDecimal old_cpm;

    @Column(name = "old_ed_dc")
    private BigDecimal old_ed_dc;

    @Column(name = "old_eg_dc")
    private BigDecimal old_eg_dc;

    @Column(name = "old_id_dc")
    private BigDecimal old_id_dc;

    @Column(name = "old_ig_dc")
    private BigDecimal old_ig_dc;

    @Column(name = "ori_addeduserid")
    private Integer ori_addeduserid;

    @Column(name = "ori_addeddatetime")
    private LocalDateTime ori_addeddatetime;

    @Column(name = "ori_updateduserid")
    private Integer ori_updateduserid;

    @Column(name = "ori_updateddatetime")
    private LocalDateTime ori_updateddatetime;

    @Column(name = "note")
    private String note;

    @Column(name = "old_promo")
    private BigDecimal old_promo;

    @Column(name = "old_offpd")
    private BigDecimal old_offpd;
    
    @Column(name = "old_loyd")
    private BigDecimal old_loyd;

    // @Column(name = "old_evp" )
    // private BigDecimal old_evp;

}

/*
 * old_ed_dc decimal(10,2)
 * old_eg_dc decimal(10,2)
 * ori_updateduserid int
 * ori_updateddatetime datetime
 * note text
 * ori_addeduserid int
 * ori_addeddatetime datetime
 * old_id_dc decimal(10,2)
 * old_ig_dc
 */