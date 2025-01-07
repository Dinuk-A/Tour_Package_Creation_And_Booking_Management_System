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

public class MyUserDetailsService implements UserDetailsService {
     @Autowired
    private UserDao userDao;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        System.out.println("Logged User :");
        System.out.println(username);

        User loggedUser = userDao.getUserByUsername(username);

        if (loggedUser == null) {
            throw new UsernameNotFoundException("Username not found" + username);
        }

        Set<GrantedAuthority> authoritiesSet = new HashSet<>();

        for(Role role : loggedUser.getRoles()){
            authoritiesSet.add(new SimpleGrantedAuthority(role.getName()));
        }

        ArrayList<GrantedAuthority> authsArrayList= new ArrayList<>(authoritiesSet);

        return new org.springframework.security.core.userdetails.User(loggedUser.getUsername(),
        loggedUser.getPassword(),
        loggedUser.getUser_status(), true, true, true, authsArrayList); 

        
    }

   


}
