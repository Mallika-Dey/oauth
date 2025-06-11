package com.example.resourceserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String address;

    // Getters and setters
}
