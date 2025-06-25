package com.example.client;

import com.example.client.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRefreshService {

    @Value("${spring.security.oauth2.client.provider.keycloak.token-uri}")
    private String tokenUri;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
    private String clientId;

//    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
//    private String clientSecret;

    private final WebClient webClient;

    public TokenResponse refreshToken(String refreshToken) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", refreshToken);
        formData.add("client_id", clientId);
//        formData.add("client_secret", clientSecret);

        try {
            Map<String, Object> response = webClient
                    .post()
                    .uri(tokenUri)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Convert to synchronous call

            return TokenResponse.builder()
                    .accessToken((String) response.get("access_token"))
                    .refreshToken((String) response.get("refresh_token"))
                    .tokenType((String) response.get("token_type"))
                    .expiresIn((Integer) response.get("expires_in"))
                    .scope((String) response.get("scope"))
                    .build();

        } catch (WebClientResponseException e) {
            log.error("Keycloak token refresh failed: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }
}
