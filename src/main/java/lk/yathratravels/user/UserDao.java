package lk.yathratravels.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserDao extends JpaRepository<User, Integer> {

    // 💥💥💥 mewaye enna one result eka naththan, default deyak ewanna puluwanda?

    // FILTER THE USER BY GIVEN EMPLOYEE ID
    @Query(value = "select u from User u where u.employee_id.id=?1") //
    public User getUserByEmployeeID(Integer empid);

    // FILTER THE USER BY GIVEN EMAIL
    @Query(value = "select u from User u where u.work_email=?1")
    public User getUserByEmail(String email);

    // FILTER THE USER BY GIVEN USER NAME
    // 💥ORIGINAL
    // @Query(value = "select u from User u where u.username=?1")
    // public User getUserByUsername(String username);

    // modified to support case sensitivity
    @Query(value = "SELECT * FROM user WHERE BINARY username = ?1", nativeQuery = true)
    public User getUserByUsername(String username);
    
    // GET ONLY THE USERNAME, BY GIVEN USER ID >>> THIS WILL BE USED FOR PRINT
    // MODULES
    // NEW CONSTRUCTOR MADE IN USER ENTITY TO REDUCE UNNECESSARY DATA LOAD
    @Query(value = "select new User(u.username) from User u where u.id=?1")
    public User getOnlyUserNameByUserId(int userid);

}
