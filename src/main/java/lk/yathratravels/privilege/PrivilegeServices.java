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
        if (userId == null) {
            return new Privilege(false, false, false, false); // No privileges for unknown user
        }

        // Step 2: Get Role IDs
        List<Integer> roleIds = privilegeDao.getRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return new Privilege(false, false, false, false); // No privileges if no roles
        }

        // Step 3: Get Module ID
        Integer moduleId = privilegeDao.getModuleIdByName(moduleName);
        if (moduleId == null) {
            return new Privilege(false, false, false, false); // No privileges if module doesn't exist
        }

        // Step 4: Fetch Privileges
        List<Object[]> privileges = privilegeDao.getPrivilegesByRoleIdsAndModuleId(moduleId, roleIds);

        // Aggregate the privileges
        boolean select = false, insert = false, update = false, delete = false;
        for (Object[] privilege : privileges) {
            select |= (boolean) privilege[0];
            insert |= (boolean) privilege[1];
            update |= (boolean) privilege[2];
            delete |= (boolean) privilege[3];
        }

        return new Privilege(select, insert, update, delete);
    }

}
