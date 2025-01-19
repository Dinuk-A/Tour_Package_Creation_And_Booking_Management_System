package lk.yathratravels.user;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import lk.yathratravels.employee.Employee;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "username")
    @NotNull
    private String username;

    @Column(name = "password")
    // @NotNull
    private String password;

    @Column(name = "company_email")
    @NotNull
    private String company_email;

    @Column(name = "note")
    private String note;

    @Column(name = "avatar")
    private byte[] avatar;

    @Column(name = "acc_status")
    @NotNull
    private Boolean acc_status;

    @ManyToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee_id;

    @ManyToMany
    @JoinTable(name = "user_has_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

    // common 6
    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    // user kenek delete karnna denna onemada 💥💥💥 ???
    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    // @Column(name = "addeduserid")
    // private Integer addeduserid;

    // @Column(name = "lastmodifieduserid")
    // private Integer lastmodifieduserid;

    // @Column(name = "deleteduserid")
    // private Integer deleteduserid;

    // custom constructor
    // to get only the username for print
    public User(String username) {
        this.username = username;
    }

}

/*
 * id int AI PK
 * username varchar(150)
 * password varchar(255)
 * email varchar(150)
 * status tinyint
 * note text
 * user_photo mediumblob
 * addeddatetime datetime
 * lastmodifieddatetime datetime
 * deleteddatetime datetime
 * addeduserid int
 * lastmodifieduserid int
 * deleteduserid int
 * employee_id int
 */