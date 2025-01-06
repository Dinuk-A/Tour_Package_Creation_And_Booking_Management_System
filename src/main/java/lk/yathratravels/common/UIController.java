package lk.yathratravels.common;

// import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class UIController {
    
    //UI for dashboard
    @GetMapping(value = "/dashboard")
    public ModelAndView dashboardUI() {
          
        ModelAndView dbView = new ModelAndView();
        dbView.setViewName("dashboard.html");
        // dbView.addObject("loggedusername", auth.getName());

        // roles godak thiyana nisa list eke palawni eka witharay enne
        // dbView.addObject("loggeduserrole", loggedUser.getRoles().iterator().next().getName());

        // dbView.addObject("loggeduserphoto", loggedUser.getUser_photo());
        dbView.addObject("title", "Yathra Dashboard");

        return dbView;
    }

    //UI for error page
    @GetMapping(value = "/error")
    public ModelAndView errorUi() {
        ModelAndView errorView = new ModelAndView();
        errorView.setViewName("error.html");
        return errorView;
    }

    
}
