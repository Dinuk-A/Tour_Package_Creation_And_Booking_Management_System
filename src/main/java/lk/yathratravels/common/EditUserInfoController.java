package lk.yathratravels.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class EditUserInfoController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @GetMapping(value = "/loggeduser", produces = "application/json")
    public EditUser getLoggedUserInfo() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User loggedUser = userDao.getUserByUsername(auth.getName());

        EditUser updatingUser = new EditUser();

        updatingUser.setId(loggedUser.getId());
        updatingUser.setUsername(loggedUser.getUsername());
        updatingUser.setEmail(loggedUser.getCompany_email());
        updatingUser.setCurrentpassword(loggedUser.getPassword());

        return updatingUser;

    }

    @PutMapping(value = "/edituserinfo")
    public String updateUserInfoFromPortal(@RequestBody EditUser editUser) {
        try {
            User existingUser = userDao.getReferenceById(editUser.getId());

              // Update password
             // Check if new password is provided
             if (editUser.getNewpassword() != null) {              
                existingUser.setPassword(bCryptPasswordEncoder.encode(editUser.getNewpassword()));
            }

            // Update other user details (username, email.)
            existingUser.setUsername(editUser.getUsername());
            existingUser.setCompany_email(editUser.getEmail());           

            userDao.save(existingUser);

            return "OK";

        } catch (Exception e) {
            return "Profile update failed " + e.getMessage();
        }
    }

    // current pw eka validate karanna wenama url ekak hadala ekata if else danawa
    // edit karanna kalin or frontend ekedima eka check kranwa

}
