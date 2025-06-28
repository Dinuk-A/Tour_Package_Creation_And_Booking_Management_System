package lk.yathratravels.employee;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lk.yathratravels.inquiry.Inq;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "emp_code")
    @NotNull
    private String emp_code;

    @Column(name = "fullname")
    @NotNull
    private String fullname;

    @Column(name = "nic")
    @NotNull
    private String nic;

    @Column(name = "email")
    @NotNull
    private String email;

    @Column(name = "mobilenum")
    @NotNull
    private String mobilenum;

    @Column(name = "landnum")
    private String landnum;

    @Column(name = "address")
    @NotNull
    private String address;

    @Column(name = "gender")
    @NotNull
    private String gender;

    @Column(name = "dob")
    @NotNull
    private LocalDate dob;

    @Column(name = "emp_photo")
    private byte[] emp_photo;

    @Column(name = "note")
    private String note;

    @Column(name = "emp_status")
    // @NotNull
    private String emp_status;

    @Column(name = "deleted_emp")
    private Boolean deleted_emp;

    @ManyToOne
    @JoinColumn(name = "designation_id", referencedColumnName = "id")
    private Designation designation_id;

    //MEKA ONE NAAAAA
    //recursion loop ekak enawa 💥💥💥💥💥💥💥
    //@JsonIgnore
    //@OneToMany(mappedBy = "assigned_userid")
    //private List<Inq> inquiries;

    // common 6
    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @Column(name = "lastmodifieduserid")
    private Integer lastmodifieduserid;

    @Column(name = "deleteduserid")
    private Integer deleteduserid;

    // custom constructor for creating Employee with emp_code and fullname
    public Employee(@NotNull String emp_code, @NotNull String fullname) {
        this.emp_code = emp_code;
        this.fullname = fullname;
    }

}

/*
 * id int AI PK
 * emp_code char(8)
 * fullname text
 * nic char(12)
 * email varchar(150)
 * mobilenum char(10)
 * landnum char(10)
 * address text
 * gender varchar(45)
 * dob date
 * note text
 * addeddatetime datetime
 * lastmodifieddatetime datetime
 * deleteddatetime datetime
 * addeduserid int
 * lastmodifieduserid int
 * deleteduserid int
 * emp_photo mediumblob
 * emp_photo_name varchar(150)
 * designation_id int
 * emp_status tinyint
 * emp_isdeleted tinyint
 */

// @Column(name = "emp_photo")
// private byte[] emp_photo;

// @Column(name = "emp_photo_name")
// private String emp_photo_name;
