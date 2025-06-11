package com.example.resourceserver;

import com.example.resourceserver.dto.UserRegistrationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private KeycloakAdminService keycloakAdmin;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto userDto) {

        // 1. Create in Keycloak
        String userId = keycloakAdmin.createUser(userDto);

        return ResponseEntity.ok("User created successfully");
    }
}
