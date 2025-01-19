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
        updatingUser.setAvatar(loggedUser.getAvatar());

        return updatingUser;

    }

    @PutMapping(value = "/edituserinfo")
    public String updateUserInfoFromPortal(@RequestBody EditUser editUser) {
        try {

            User existingUser = userDao.getReferenceById(editUser.getId());

            // Validate current password
            if (!bCryptPasswordEncoder.matches(editUser.getCurrentpassword(), existingUser.getPassword())) {
                return "Invalid current password";
            }

            // Update password
            // Check if a new password is provided, and then set it
            if (editUser.getNewpassword() != null) {
                existingUser.setPassword(bCryptPasswordEncoder.encode(editUser.getNewpassword()));
            }

            // Update other user details (username, avatar.)
            existingUser.setUsername(editUser.getUsername());
            existingUser.setAvatar(editUser.getAvatar());

            userDao.save(existingUser);

            return "OK";

        } catch (Exception e) {
            return "Profile update failed " + e.getMessage();
        }
    }

    // current pw eka validate karanna wenama url ekak hadala ekata if else danawa
    // edit karanna kalin or frontend ekedima eka check kranwa

}
