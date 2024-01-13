package com.example.oauth.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/test/api")
    @PreAuthorize("hasRole('client_user')")
    public String test() {
        return "ok";
    }

    @GetMapping("/test/api/admin")
    @PreAuthorize("hasRole('client_admin')")
    public String test_admin() {
        return "ok from admin";
    }
}
