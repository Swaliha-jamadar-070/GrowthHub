package com.roadmap.repository;

import com.roadmap.model.DailyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyTaskRepository extends JpaRepository<DailyTask, Long> {
    
    List<DailyTask> findByUserIdOrderByDayAsc(Long userId);
    
    Optional<DailyTask> findByUserIdAndDay(Long userId, Integer day);
    
    List<DailyTask> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.overallCompleted = true")
    Integer countCompletedDays(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId")
    Integer countTotalDays(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.javaCompleted = true")
    Integer countJavaCompleted(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.leetcodeCompleted = true")
    Integer countLeetcodeCompleted(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.dsaCompleted = true")
    Integer countDsaCompleted(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.sqlCompleted = true")
    Integer countSqlCompleted(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.projectCompleted = true")
    Integer countProjectCompleted(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(d) FROM DailyTask d WHERE d.user.id = :userId AND d.githubCompleted = true")
    Integer countGithubCompleted(@Param("userId") Long userId);
}