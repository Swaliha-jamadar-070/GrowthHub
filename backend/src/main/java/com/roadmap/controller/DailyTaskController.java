package com.roadmap.controller;

import com.roadmap.model.DailyTask;
import com.roadmap.model.ProgressStats;
import com.roadmap.service.DailyTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3001")
public class DailyTaskController {
    
    @Autowired
    private DailyTaskService taskService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DailyTask>> getUserTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getUserTasks(userId));
    }
    
    @GetMapping("/user/{userId}/day/{day}")
    public ResponseEntity<DailyTask> getUserTaskByDay(@PathVariable Long userId, @PathVariable Integer day) {
        return ResponseEntity.ok(taskService.getUserTaskByDay(userId, day));
    }
    
    @PostMapping("/user/{userId}/day/{day}")
    public ResponseEntity<DailyTask> createTask(
            @PathVariable Long userId,
            @PathVariable Integer day,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(taskService.createDailyTask(userId, day, date));
    }
    
    @PostMapping("/user/{userId}/initialize")
    public ResponseEntity<?> initializeTasks(@PathVariable Long userId, @RequestParam Integer totalDays) {
        taskService.initializeTasksForMonth(userId, totalDays);
        return ResponseEntity.ok(Map.of("message", "Tasks initialized successfully"));
    }
    
    @PutMapping("/{taskId}")
    public ResponseEntity<DailyTask> updateTask(
            @PathVariable Long taskId,
            @RequestBody DailyTask task) {
        System.out.println("Updating task: " + taskId);
        System.out.println("Received task: " + task);
        return ResponseEntity.ok(taskService.updateDailyTask(taskId, task));
    }
    
    @GetMapping("/user/{userId}/progress")
    public ResponseEntity<ProgressStats> getProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getUserProgress(userId));
    }
}