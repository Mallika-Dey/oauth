package com.example.resourceserver;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AppController {

    @GetMapping("/user")
    @PreAuthorize("hasRole('user')")
    public String test() {
        return "ok";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ROLE_admin')")
    public String test_admin() {
        return "ok from admin";
    }
}
