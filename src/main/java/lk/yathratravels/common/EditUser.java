package lk.yathratravels.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditUser {

    private Integer id;
    private String username;    
    private String newpassword;
    private String currentpassword;
    private byte[] avatar;
    
}
