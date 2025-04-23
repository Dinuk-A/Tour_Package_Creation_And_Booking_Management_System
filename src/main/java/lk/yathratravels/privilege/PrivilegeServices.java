package lk.yathratravels.privilege;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrivilegeServices {

    @Autowired
    private PrivilegeDao privilegeDao;

    public Privilege getPrivileges(String username, String moduleName) {
        // Admin user has full access
        if ("Admin".equals(username)) {
            return new Privilege(true, true, true, true);
        }

        // Step 1: Get User ID
        Integer userId = privilegeDao.getUserIdByUsername(username);
        System.out.println("User ID for username '" + username + "': " + userId);
        if (userId == null) {
            return new Privilege(false, false, false, false); // No privileges for unknown user
        }

        // Step 2: Get Role IDs
        List<Integer> roleIds = privilegeDao.getRoleIdsByUserId(userId);
        System.out.println("Role IDs for user ID " + userId + ": " + roleIds);
        if (roleIds.isEmpty()) {
            return new Privilege(false, false, false, false); // No privileges if no roles
        }

        // Step 3: Get Module ID
        Integer moduleId = privilegeDao.getModuleIdByName(moduleName);
        System.out.println("Module ID for module name '" + moduleName + "': " + moduleId);
        if (moduleId == null) {
            return new Privilege(false, false, false, false); // No privileges if module doesn't exist
        }

        // Step 4: Fetch Privileges
        List<Object[]> privileges = privilegeDao.getPrivilegesByRoleIdsAndModuleIdNew(moduleId, roleIds);

        System.out.println("Raw Privileges fetched: " + privileges);

        // Aggregate the privileges
        boolean select = false, insert = false, update = false, delete = false;
        for (Object[] privilege : privileges) {
            // ORIGINAL
            // select |= (boolean) privilege[0];
            // insert |= (boolean) privilege[1];
            // update |= (boolean) privilege[2];
            // delete |= (boolean) privilege[3];

            // select |= ((Integer) privilege[0]) == 1;
            // insert |= ((Integer) privilege[1]) == 1;
            // update |= ((Integer) privilege[2]) == 1;
            // delete |= ((Integer) privilege[3]) == 1;

            Number selectVal = (Number) privilege[0];
            Number insertVal = (Number) privilege[1];
            Number updateVal = (Number) privilege[2];
            Number deleteVal = (Number) privilege[3];
            
            select |= selectVal.intValue() == 1;
            insert |= insertVal.intValue() == 1;
            update |= updateVal.intValue() == 1;
            delete |= deleteVal.intValue() == 1;

        }

        return new Privilege(select, insert, update, delete);
    }

}
