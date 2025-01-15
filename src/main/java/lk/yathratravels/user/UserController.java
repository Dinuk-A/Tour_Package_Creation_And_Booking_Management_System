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

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;

@RestController
public class UserController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private PrivilegeServices privilegeService;

    // display user UI
    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public ModelAndView showUserUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "USER");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;
        } else {
            ModelAndView userView = new ModelAndView();
            userView.setViewName("user.html");
            userView.addObject("username", auth.getName());
            userView.addObject("title", "Yathra User");
            userView.addObject("moduleName", "User Account Management");

            return userView;
        }

    }

    // get all employee list from DB
    @GetMapping(value = "/user/all", produces = "application/json")
    public List<User> getAllUsers() {

        return userDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // this will be used for prints only
    @GetMapping(value = "/username/byid/{userid}", produces = "application/json")
    public User getUserNameByUserId(@PathVariable("userid") int userID) {
        return userDao.getOnlyUserNameByUserId(userID);
    }

    // save user record on DB
    @PostMapping(value = "/user")
    public String saveUser(@RequestBody User user) {

        // authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Privilege loggedUserPrivilege =
        // prvcntrler.getPrivilegesByUserAndModule(auth.getName(), "USER");
        //
        // if (!loggedUserPrivilege.getPrivinsert()) {
        // return "Save Not Completed You Dont Have Permission";
        // }

        // duplications #01 === by employee ecord
        User existingUserEmployee = userDao.getUserByEmployeeID(user.getEmployee_id().getId());
        if (existingUserEmployee != null) {
            return "User save not completed : Given Employee alredy have an user account";
        }

        // duplications #02 === by email
        User isUserEmailExist = userDao.getUserByEmail(user.getEmail());
        if (isUserEmailExist != null) {
            return "User save not completed : Given email already exist for another user account";
        }

        // duplications #03 === by username
        User existingUserByUsername = userDao.getUserByUsername(user.getUsername());
        if (existingUserByUsername != null) {
            return "User save not completed : Given username already exist for another user account";
        }

        try {

            user.setAddeddatetime(LocalDateTime.now());
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

            userDao.save(user);

            return "OK";

        } catch (Exception e) {
            return "Save Not Completed :" + e.getMessage();
        }
    }

    // to update an existing user record
    @PutMapping(value = "/user")
    public String updateUser(@RequestBody User user) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //
        // Privilege loggedUserPrivilege =
        // prvcntrler.getPrivilegesByUserAndModule(auth.getName(), "USER");
        //
        // if (!loggedUserPrivilege.getPrivupdate()) {
        // return "Update not completed you dont have permission";
        // }

        // meka and thawa modules wala existing recs wala ids check karanna edit karanna
        // ena object eke console log eken
        User existingUser = userDao.getReferenceById(user.getId());

        //admin wisin user kenekge pw change krna ekata ;ogic ejaj hithanna
        //me parana yathra eken, me logic eka epa

        //if (user.getPassword() != null) {
        //    if (bCryptPasswordEncoder.matches(user.getPassword(), isUserExist.getPassword())) {
        //        return "Update Not Complete : same pw";
        //    } else {
        //        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        //    }
        //} else {
        //    user.setPassword((isUserExist.getPassword()));
        //}
        
        try {
            user.setLastmodifieddatetime(LocalDateTime.now());
            userDao.save(user);
            return "OK";
        } catch (Exception e) {
            return "Update not completed" + e.getMessage();
        }

       
    }

    @DeleteMapping(value = "/user")
    public String deleteUser(@RequestBody User user) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

//        Privilege loggedUserPrivilege = prvcntrler.getPrivilegesByUserAndModule(auth.getName(), "USER");
//
//        if (!loggedUserPrivilege.getPrivdelete()) {
//            return "Delete Not Completed : You Dont Have Permission";
//        }

        // exist
        User existingUser = userDao.getReferenceById(user.getId());
        if (existingUser == null) {
            return "Delete Not Completed : USER NOT FOUND ";
        }
        try {
            existingUser.setDeleteddatetime(LocalDateTime.now());
            existingUser.setAcc_status(false); 
            userDao.save(existingUser);
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }
    }
}
