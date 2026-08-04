package com.roadmap.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "weekly_focus")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeekFocus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Integer week;
    
    @Column(nullable = false, length = 500)
    private String java;
    
    @Column(name = "leetcode_dsa", nullable = false, length = 500)
    private String leetcodeDsa;
    
    @Column(nullable = false, length = 500)
    private String projects;
    
    @Column(nullable = false, length = 500)
    private String other;
}