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

                    .requestMatchers("/dashboard").permitAll()

                    .requestMatchers("/edituserinfo").permitAll()

                    .requestMatchers("/nationalityforweb/**").permitAll()
                    .requestMatchers("/attractionforweb/**").permitAll()
                    .requestMatchers("/dayplanforweb/**").permitAll()
                    .requestMatchers("/tourpackageforweb/**").permitAll()
                    .requestMatchers("/yathra").permitAll()

                    .requestMatchers("/emp/**").hasAnyAuthority("System_Admin", "Manager")

                    .requestMatchers("/user/**").hasAnyAuthority("System_Admin", "Manager")

                    .requestMatchers("/privilege/**").hasAnyAuthority("System_Admin", "Manager", "Assistant Manager")

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
