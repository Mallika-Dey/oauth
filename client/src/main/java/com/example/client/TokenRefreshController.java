package com.example.client;

import com.example.client.dto.RefreshTokenRequest;
import com.example.client.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class TokenRefreshController {

    private final TokenRefreshService tokenRefreshService;

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            log.debug("Processing token refresh request");
             TokenResponse response = tokenRefreshService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(TokenResponse.builder()
                            .error("invalid_grant")
                            .errorDescription("Token refresh failed: " + e.getMessage())
                            .build());
        }
    }
}
