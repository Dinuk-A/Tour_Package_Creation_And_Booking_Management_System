package lk.yathratravels.user;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoleDao extends JpaRepository<Role, Integer>{

    //get all the roles except Admin
    @Query(value = "select r from Role r where r.name <> 'Admin' ")  
    public List<Role> getAllRolesExceptAdmin();

    //get a role by passing its name
    @Query(value = "select r from Role r where r.name = ?1")
    public Role getRoleByName(String name);  
}

