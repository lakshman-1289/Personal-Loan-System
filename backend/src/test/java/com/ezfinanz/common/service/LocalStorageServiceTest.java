package com.ezfinanz.common.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

class LocalStorageServiceTest {

    private LocalStorageService storageService;
    private final Path rootLocation = Paths.get("uploads");
    private String storedPath;

    @BeforeEach
    void setUp() {
        storageService = new LocalStorageService();
        storageService.init();
        storedPath = null;
    }

    @AfterEach
    void tearDown() throws IOException {
        if (storedPath != null) {
            String filename = storedPath.replace("/uploads/", "");
            Path filePath = rootLocation.resolve(filename);
            Files.deleteIfExists(filePath);
        }
    }

    @Test
    void store_Success() throws IOException {
        MockMultipartFile mockFile = new MockMultipartFile(
                "document",
                "test-document.jpg",
                "image/jpeg",
                "Mock document content".getBytes()
        );

        storedPath = storageService.store(mockFile);

        assertNotNull(storedPath);
        assertTrue(storedPath.startsWith("/uploads/"));
        assertTrue(storedPath.endsWith(".jpg"));

        String filename = storedPath.replace("/uploads/", "");
        Path savedFile = rootLocation.resolve(filename);
        assertTrue(Files.exists(savedFile));
        assertEquals("Mock document content", Files.readString(savedFile));
    }

    @Test
    void store_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "document",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThrows(IllegalArgumentException.class, () -> storageService.store(emptyFile));
    }
}
