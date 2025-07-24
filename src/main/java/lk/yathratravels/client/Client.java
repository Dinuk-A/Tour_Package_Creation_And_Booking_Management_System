package lk.yathratravels.client;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lk.yathratravels.inquiry.Nationality;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "client")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "clientcode")
    private String clientcode;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "passportornic")
    private String passportornic;

    @Column(name = "contactone")
    private String contactone;

    @Column(name = "contacttwo")
    private String contacttwo;

    @Column(name = "email")
    private String email;

    @Column(name = "note")
    private String note;

    @Column(name = "cli_status")
    private String cli_status;
    //["New", "Active", "Inactive", "Archived", "Blacklisted"]

    @ManyToOne
    @JoinColumn(name = "nationality_id", referencedColumnName = "id")
    private Nationality nationality_id;

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

}

/*
 * id int AI PK
 * fullname varchar(45)
 * clientcode varchar(45)
 * passportornic varchar(45)
 * contactone varchar(45)
 * contacttwo varchar(45)
 * email varchar(45)
 * note text
 * cli_status varchar(45)
 * addeddatetime datetime
 * lastmodifieddatetime datetime
 * deleteddatetime datetime
 * addeduserid int
 * lastmodifieduserid int
 * deleteduserid int
 */
