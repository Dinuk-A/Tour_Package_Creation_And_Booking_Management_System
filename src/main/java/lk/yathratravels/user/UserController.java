package lk.yathratravels.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class UserController {
    
    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public ModelAndView userUi() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        ModelAndView userView = new ModelAndView(); // create modalandview obj for return a ui
        userView.setViewName("user.html"); // set view name
        // userView.addObject("username", auth.getName());
        userView.addObject("title", "Yathra User");

        return userView;
    }

    @GetMapping(value = "/user/all", produces = "application/json")
    public List<User> getUserAllData() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Privilege loggedUserPrivilege = prvcntrler.getPrivilegesByUserAndModule(auth.getName(), "USER");
        // if (!loggedUserPrivilege.getPrivselect()) {
        //     return new ArrayList<User>();
        // }

        return userDao.findAll(Sort.by(Direction.DESC, "id"));
    }

}
