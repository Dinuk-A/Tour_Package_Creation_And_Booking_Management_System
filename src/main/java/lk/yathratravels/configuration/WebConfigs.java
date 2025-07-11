package lk.yathratravels.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebConfigs {

    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests((auth) -> {
            auth
                    .requestMatchers("/commonscripts/**", "/controllerJSs/**", "/css/**", "/images/**", "/libs/**")
                    .permitAll()
                    .requestMatchers("/login").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/createadmin").permitAll()
                    // dashboard ekatath roles okkoma denawada permit all nodi???
                    .requestMatchers("/dashboard").permitAll()
                    .requestMatchers("/lost").permitAll()
                    .requestMatchers("/edituserinfo").permitAll()
                    .requestMatchers("/nationalityforweb/**").permitAll()
                    .requestMatchers("/attractionforweb/**").permitAll()
                    .requestMatchers("/dayplanforweb/**").permitAll()
                    .requestMatchers("/tourpackageforweb/**").permitAll()
                    .requestMatchers("/yathra").permitAll()
                    .requestMatchers("/inquiryfromweb").permitAll()
                    // .requestMatchers(HttpMethod.POST, "/inquiryfromweb").permitAll()
                    .requestMatchers("/district").permitAll()
                    .requestMatchers("/province").permitAll()

                    // loggeduser 💥💥💥
                    // edituserinfo 💥💥💥
                    // desig 💥💥💥
                    // empinfo 💥💥💥
                    // nationality 💥💥💥
                    // module 💥💥💥

                    .requestMatchers("/emp/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/user/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")
                    .requestMatchers("/privilege/**").hasAnyAuthority("System_Admin", "Assistant Manager", "Manager")

                    .requestMatchers("/pricemods/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/pricemodhistory/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/attraction/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/booking/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    // ext personal and ext vehicles 💥💥💥

                    .requestMatchers("/booking/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/dayplan/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/inq/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/followup/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/lunchplace/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/stay/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/staytype/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    // additionalcosts 💥💥💥

                    .requestMatchers("/vehicle/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .requestMatchers("/vehitypes/**")
                    .hasAnyAuthority("System_Admin", "Manager", "Assistant Manager", "Executive")

                    .anyRequest().authenticated();

        })

                .formLogin((logins) -> {
                    logins

                            .loginPage("/login")

                            .usernameParameter("username")

                            .passwordParameter("password")

                            .defaultSuccessUrl("/dashboard", true)

                            .failureUrl("/login?error=invalidusernamepassword");

                })

                .logout((logout) -> {
                    logout
                            .logoutUrl("/logout")

                            .logoutSuccessUrl("/login");
                })

                .csrf((csrf) -> csrf.disable())

                .exceptionHandling((exp) -> exp.accessDeniedPage("/error"));

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        bCryptPasswordEncoder = new BCryptPasswordEncoder();
        return bCryptPasswordEncoder;

    }
}
