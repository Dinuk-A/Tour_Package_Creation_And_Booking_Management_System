package lk.yathratravels.privilege;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrivilegeDao extends JpaRepository<Privilege, Integer> {

    @Query("select p from Privilege p where p.role_id.id=?1 and p.module_id.id=?2")
    Privilege getPrivisByBothRoleAndModule(Integer roleid, Integer moduleid);

    // Fetch User ID by Username
    @Query(value = "SELECT u.id FROM user u WHERE u.username = ?1", nativeQuery = true)
    Integer getUserIdByUsername(String username);

    // Fetch Role IDs for a User
    @Query(value = "SELECT ur.role_id FROM user_has_role ur WHERE ur.user_id = ?1", nativeQuery = true)
    List<Integer> getRoleIdsByUserId(Integer userId);

    // Fetch Module ID by Module Name
    @Query(value = "SELECT m.id FROM module m WHERE m.name = ?1", nativeQuery = true)
    Integer getModuleIdByName(String moduleName);

    // Fetch Privileges by Role IDs and Module ID
    // ORIGINAL
    @Query(value = "SELECT p.prvselect, p.prvinsert, p.prvupdate, p.prvdelete " +
            "FROM privilege p " +
            "WHERE p.module_id = ?1 AND p.role_id IN (:roleIds)", nativeQuery = true)
    List<Object[]> getPrivilegesByRoleIdsAndModuleId(Integer moduleId, List<Integer> roleIds);

    // NEW
    @Query(value = "SELECT p.prvselect, p.prvinsert, p.prvupdate, p.prvdelete " +
            "FROM privilege p " +
            "WHERE p.module_id = :moduleId AND p.role_id IN (:roleIds)", nativeQuery = true)
    List<Object[]> getPrivilegesByRoleIdsAndModuleIdNew(@Param("moduleId") Integer moduleId,
            @Param("roleIds") List<Integer> roleIds);

    // Step 1: Identify the module_id for the specified modulename.

    // Step 2: Identify the role_ids assigned to the user based on the username.

    /*
     * It first finds the user_id by looking up the username (the first parameter,
     * username) in the user table.
     * Then, it finds the role_ids associated with that user_id from the
     * user_has_role table. This links the user to the roles they belong to.
     */

    // Step 3: Filter the privilege table for the identified module_id and role_ids.

    // Step 4: Aggregate the privilege flags using BIT_OR to ensure that if any role
    // has the privilege enabled, it will be considered.

    // explain or refine step by step ??????????
    // @Query(value = "SELECT bit_or(p.prvselect) as pri_select ,
    // bit_or(p.prvinsert) as pri_insert , bit_or(p.prvupdate) as pri_update
    // ,bit_or(p.prvdelete) as pri_delete FROM privilege as p where p.module_id in
    // (SELECT m.id FROM module as m where m.name =?2) and p.role_id in (SELECT
    // ur.role_id FROM user_has_role as ur where ur.user_id in (SELECT u.id FROM
    // user as u where u.username =?1))", nativeQuery = true)
    // public String getPrivilegesByUserAndModuleOri(String username, String
    // modulename);
    //
    // @Query(value = """
    // SELECT
    // bit_or(p.prvselect) as pri_select,
    // bit_or(p.prvinsert) as pri_insert,
    // bit_or(p.prvupdate) as pri_update,
    // bit_or(p.prvdelete) as pri_delete
    // FROM privilege p
    // JOIN module m ON p.module_id = m.id
    // JOIN user_has_role uhr ON p.role_id = uhr.role_id
    // JOIN user u ON uhr.user_id = u.id
    // WHERE m.name = ?2 AND u.username = ?1
    // """, nativeQuery = true)
    // public String getPrivilegesByUserAndModule(String username, String
    // modulename);

}
