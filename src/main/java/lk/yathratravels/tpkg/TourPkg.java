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
@Table(name = "tpkg")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPkg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "tpkgtitle")
    private String tpkgtitle;

    @ManyToMany
    @JoinTable(name = "tpkg_has_dayplan", joinColumns = @JoinColumn(name = "tpkg_id"), inverseJoinColumns = @JoinColumn(name = "dayplan_id"))
    private Set<DayPlan> dayplans;
}
