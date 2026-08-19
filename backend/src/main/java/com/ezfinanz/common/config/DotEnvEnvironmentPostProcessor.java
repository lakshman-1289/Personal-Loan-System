package com.ezfinanz.common.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // Try to load .env from the root of the project
        Path path = Paths.get(".env");
        if (!Files.exists(path)) {
            // Try parent path in case of subdirectory running
            path = Paths.get("../.env");
        }

        if (Files.exists(path)) {
            try {
                List<String> lines = Files.readAllLines(path);
                Map<String, Object> dotenvProps = new HashMap<>();

                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }

                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();

                        // Strip surrounding quotes
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }

                        dotenvProps.put(key, value);
                    }
                }

                if (!dotenvProps.isEmpty()) {
                    environment.getPropertySources().addLast(new MapPropertySource("dotenv", dotenvProps));
                    System.out.println("[DotEnv] Loaded environment properties from " + path.toAbsolutePath());
                }
            } catch (IOException e) {
                System.err.println("[DotEnv] Failed to load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("[DotEnv] No .env file found at " + path.toAbsolutePath() + ", using defaults.");
        }
    }
}
