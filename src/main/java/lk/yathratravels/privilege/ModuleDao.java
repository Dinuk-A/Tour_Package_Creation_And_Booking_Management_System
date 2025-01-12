package lk.yathratravels.privilege;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ModuleDao extends JpaRepository<Module, Integer> {

    //to find module names that didnt given privileges to this role before
    @Query("select m from Module m where m.id not in(select p.module_id.id from Privilege p where p.role_id.id=?1)")
    public List<Module> getModulesByRole(Integer roleid);

    // 1st step === select module ids from PRIVILEGE TABLE where the related role id  equals to the given role id in passing parameter
    
    // (ex: passing role id is 1(Manager), so select modules that has  1 as the role id in their row)

    // 2nd === select modules from MODULE TABLE where module id is not in that previously found list in 1st step

}
