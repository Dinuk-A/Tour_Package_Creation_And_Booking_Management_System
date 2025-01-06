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
    private String currentpw;
    private String newpw;
    private String email;
    private byte[] user_photo;
}
