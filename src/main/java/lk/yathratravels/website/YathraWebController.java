package lk.yathratravels.website;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.dayplan.DayPlan;
import lk.yathratravels.dayplan.DayPlanDao;
import lk.yathratravels.inquiry.Nationality;
import lk.yathratravels.inquiry.NationalityDao;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.attraction.Attraction;
import lk.yathratravels.attraction.AttractionDao;
import lk.yathratravels.tpkg.TourPkg;
import lk.yathratravels.tpkg.TourPkgDao;

@RestController

public class YathraWebController {

    @Autowired
    private AttractionDao attrDao;

    @Autowired
    private DayPlanDao dpDao;

    @Autowired
    private TourPkgDao tPkgDao;

    @Autowired
    private NationalityDao natDao;

    @RequestMapping(value = "/yathra", method = RequestMethod.GET)
    public ModelAndView yathraUI() {
        ModelAndView yathraView = new ModelAndView();
        yathraView.setViewName("yathra.html");
        return yathraView;
    }

    @GetMapping(value = "/attractionforweb/alldata")
    public List<Attraction> getAttrAllDList() {

        return attrDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    @GetMapping(value = "/dayplanforweb/alldata", produces = "application/JSON")
    public List<DayPlan> getDayPlanAllData() {

        return dpDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    @GetMapping(value = "/tourpackageforweb/all", produces = "application/json")
    public List<TourPkg> getAllTourPackageData() {

        return tPkgDao.getPkgsToShowWebsite();
    }

    @GetMapping(value = "/nationalityforweb/alldata", produces = "application/json")
    public List<Nationality> getNationalityAllData() {
        return natDao.findAll();
    }

}
