package lk.yathratravels.privilege;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lk.yathratravels.user.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "privilege")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Privilege {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "prvselect")
    @NotNull
    private Boolean prvselect;

    @Column(name = "prvinsert")
    @NotNull
    private Boolean prvinsert;

    @Column(name = "prvupdate")
    @NotNull
    private Boolean prvupdate;

    @Column(name = "prvdelete")
    @NotNull
    private Boolean prvdelete;

    @ManyToOne
    @JoinColumn(name = "module_id", referencedColumnName = "id")
    private Module module_id;

    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private Role role_id;

    @Column(name = "deleted_privi")
    private Boolean deleted_privi;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    // custom constructor
    public Privilege(Boolean prvselect, Boolean prvinsert, Boolean prvupdate, Boolean prvdelete) {
        this.prvselect = prvselect;
        this.prvinsert = prvinsert;
        this.prvupdate = prvupdate;
        this.prvdelete = prvdelete;
    }

}
