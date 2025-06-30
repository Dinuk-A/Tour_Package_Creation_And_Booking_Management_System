package lk.yathratravels.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    private UserDao userDao;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

         // Print the username of user trying to log in
        System.out.println("Logged User : " + username);
   
        // Get user details from the database using the username
        User loggedUser = userDao.getUserByUsername(username);
        
         // If user is not found, throw an exception
        if (loggedUser == null) {
            throw new UsernameNotFoundException("Username not found" + username);
        }

        // Print the user's roles (just for debugging purposes)
        System.out.println("Role: " + loggedUser.getRoles());

        // Convert user roles into Spring Security's GrantedAuthority objects
        Set<GrantedAuthority> authoritiesSet = new HashSet<>();
        for (Role role : loggedUser.getRoles()) {
            authoritiesSet.add(new SimpleGrantedAuthority(role.getName()));
        }

        // Convert the set to a list
        ArrayList<GrantedAuthority> authsArrayList = new ArrayList<>(authoritiesSet);

        // Return a Spring Security User object with username, password, account status, and roles
        return new org.springframework.security.core.userdetails.User(loggedUser.getUsername(),
                loggedUser.getPassword(),
                loggedUser.getAcc_status(), true, true, true, authsArrayList);

    }

}
