package com.roadmap.controller;

import com.roadmap.model.WeekFocus;
import com.roadmap.repository.WeekFocusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/weekly")
@CrossOrigin(origins = "http://localhost:3000")
public class WeekFocusController {
    
    @Autowired
    private WeekFocusRepository weekFocusRepository;
    
    @GetMapping
    public ResponseEntity<List<WeekFocus>> getAllWeeks() {
        return ResponseEntity.ok(weekFocusRepository.findAllByOrderByWeekAsc());
    }
    
    @GetMapping("/{week}")
    public ResponseEntity<WeekFocus> getWeek(@PathVariable Integer week) {
        return weekFocusRepository.findByWeek(week)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}