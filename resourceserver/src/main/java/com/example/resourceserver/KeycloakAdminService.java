package com.example.resourceserver;

import com.example.resourceserver.dto.UserRegistrationDto;
import jakarta.ws.rs.core.Response;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    public String createUser(UserRegistrationDto userDto) {
        // 1. Authenticate admin client using PASSWORD grant type
        Keycloak keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Authenticate against master realm
                .grantType(OAuth2Constants.PASSWORD) // Use PASSWORD grant type
                .clientId("admin-cli") // Use admin-cli public client
                .username("admin") // Replace with your actual Keycloak admin username
                .password("password") // Replace with your actual Keycloak admin password
                .build();

        try {
            // 2. Prepare user representation
            UserRepresentation user = new UserRepresentation();
            user.setEnabled(true);
            user.setUsername(userDto.getUsername());
            user.setEmail(userDto.getEmail());
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());

            // 3. Set password
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(userDto.getPassword());
            credential.setTemporary(false);
            user.setCredentials(Collections.singletonList(credential));

            // 4. Create user in your target realm (not master)
            Response response = keycloak.realm(realm).users().create(user);

            if (response.getStatus() != 201) {
                throw new RuntimeException("Keycloak user creation failed with status: " + response.getStatus());
            }

            // 5. Get created user ID
            String userId = response.getLocation().getPath()
                    .replaceAll(".*/([^/]+)$", "$1");

            return userId;
        } finally {
            keycloak.close();
        }
    }
}