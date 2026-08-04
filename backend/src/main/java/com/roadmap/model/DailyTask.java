package com.roadmap.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_tasks", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "day"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer day;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "java_status")
    private Boolean javaCompleted = false;
    
    @Column(name = "leetcode_status")
    private Boolean leetcodeCompleted = false;
    
    @Column(name = "dsa_status")
    private Boolean dsaCompleted = false;
    
    @Column(name = "sql_status")
    private Boolean sqlCompleted = false;
    
    @Column(name = "project_status")
    private Boolean projectCompleted = false;
    
    @Column(name = "github_status")
    private Boolean githubCompleted = false;
    
    @Column(name = "overall_status")
    private Boolean overallCompleted = false;
    
    @Column(length = 1000)
    private String notes = "";
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateOverallStatus();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateOverallStatus();
    }
    
    // Changed from private to public
    public void calculateOverallStatus() {
        // Only calculate if all statuses are not null
        if (javaCompleted != null && leetcodeCompleted != null &&
                dsaCompleted != null && sqlCompleted != null &&
                projectCompleted != null && githubCompleted != null) {

            this.overallCompleted = javaCompleted && leetcodeCompleted &&
                    dsaCompleted && sqlCompleted &&
                    projectCompleted && githubCompleted;
        } else {
            this.overallCompleted = false;
        }
    }
}