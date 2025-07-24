package lk.yathratravels.client;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class ClientController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ClientDao clientDao;

    // get client ui
    @RequestMapping(value = "/client", method = RequestMethod.GET)
    public ModelAndView showClientUI() throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "CLIENT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;
        } else {
            ModelAndView clientView = new ModelAndView();
            clientView.setViewName("client.html");
            clientView.addObject("loggedUserUN", auth.getName());
            clientView.addObject("title", "Yathra Client");
            clientView.addObject("moduleName", "Client Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            clientView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            // get all the roles as a custom array
            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            clientView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            return clientView;
        }
    }

    // get all client list from DB
    @GetMapping(value = "/client/all", produces = "application/json")
    public List<Client> getAllClients() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "CLIENT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Client>();
        }

        return clientDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // get client by email
    @GetMapping(value = "/client/byemail", params = { "email" }, produces = "application/json")
    public List<Client> getClientsByEmail(@RequestParam("email") String email) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "CLIENT");
        // if (!privilegeLevelForLoggedUser.getPrvselect()) {
        // return new ArrayList<>();
        // }

        return clientDao.findClientsByEmail(email);
    }

    // save a new client
    @PostMapping(value = "/client")
    public String saveClient(@RequestBody Client client) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "CLIENT");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Client Save Not Completed; You Don't Have Permission";
        }

        try {

            client.setAddeddatetime(LocalDateTime.now());
            client.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            clientDao.save(client);

            return "OK";
        } catch (Exception e) {
            return "Save not completed: " + e.getMessage();
        }
    }

    // update
    @PutMapping(value = "/client")
    public String updateClient(@RequestBody Client client) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "CLIENT");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Client Update Not Completed; You Don't Have Permission";
        }

        try {
            
            client.setLastmodifieddatetime(LocalDateTime.now());
            client.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            clientDao.save(client);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed; " + e.getMessage();
        }
    }

}
