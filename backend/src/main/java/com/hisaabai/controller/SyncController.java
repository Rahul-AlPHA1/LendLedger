package com.hisaabai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
public class SyncController {

    // This is a placeholder for the actual sync logic.
    // In a real application, this would interact with SyncService and Repositories.

    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushData(@RequestBody Map<String, Object> payload) {
        // Handle incoming localStorage dump (contacts, transactions)
        // Merge logic goes here
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Data synced successfully to PostgreSQL");
        response.put("lastSyncAt", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pull")
    public ResponseEntity<Map<String, Object>> pullData() {
        // Fetch data from PostgreSQL and return to client
        Map<String, Object> response = new HashMap<>();
        response.put("contacts", new java.util.ArrayList<>());
        response.put("transactions", new java.util.ArrayList<>());
        return ResponseEntity.ok(response);
    }
}
