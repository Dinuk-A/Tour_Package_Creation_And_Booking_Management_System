package lk.yathratravels.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClientService {

    @Autowired
    private ClientDao clientDao;

    public void assignNextClientCode(Client client) {
        String nextClientCode = clientDao.getNextClientCode();
        if (nextClientCode == null || nextClientCode.equals("")) {
            client.setClientcode("CL00001");
        } else {
            client.setClientcode(nextClientCode);
        }

        System.out.println("Next Client Code: " + client.getClientcode());
        System.out.println("assignNextClientCode ran successfully");
    }
}

