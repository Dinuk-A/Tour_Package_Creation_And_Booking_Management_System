package lk.yathratravels.privilege;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PrivilegeDao extends JpaRepository<Privilege, Integer> {

    @Query("select p from Privilege p where p.role.id=?1 and p.module.id=?2")
    Privilege getPrivisByBothRoleAndModule(Integer roleid, Integer moduleid);

    // explain or refine step by step ??????????
    @Query(value = "SELECT bit_or(p.privselect) as pri_select , bit_or(p.privinsert) as pri_insert , bit_or(p.privupdate) as pri_update ,bit_or(p.privdelete) as pri_delete FROM privilege as p where p.module_id in (SELECT m.id FROM module as m where m.name =?2) and p.role_id in (SELECT ur.role_id FROM user_has_role as ur where ur.user_id in (SELECT u.id FROM user as u where u.username =?1))", nativeQuery = true)
    public String getPrivilegesByUserAndModule(String username, String modulename);

}
