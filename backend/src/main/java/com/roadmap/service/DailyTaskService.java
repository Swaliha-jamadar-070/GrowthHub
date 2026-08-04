package com.roadmap.service;

import com.roadmap.model.DailyTask;
import com.roadmap.model.ProgressStats;
import com.roadmap.model.User;
import com.roadmap.repository.DailyTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class DailyTaskService {
    
    @Autowired
    private DailyTaskRepository dailyTaskRepository;
    
    @Autowired
    private UserService userService;
    
    @Transactional
    public DailyTask createDailyTask(Long userId, Integer day, LocalDate date) {
        User user = userService.getUserById(userId);

        DailyTask existingTask = dailyTaskRepository.findByUserIdAndDay(userId, day).orElse(null);
        if (existingTask != null) {
            return existingTask;
        }
        
        DailyTask task = new DailyTask();
        task.setDay(day);
        task.setDate(date);
        task.setUser(user);
        task.setJavaCompleted(false);
        task.setLeetcodeCompleted(false);
        task.setDsaCompleted(false);
        task.setSqlCompleted(false);
        task.setProjectCompleted(false);
        task.setGithubCompleted(false);
        task.setOverallCompleted(false);
        task.setNotes("");
        
        return dailyTaskRepository.save(task);
    }
    
    @Transactional
    public DailyTask updateDailyTask(Long taskId, DailyTask updatedTask) {
        DailyTask existing = dailyTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Update statuses - ALWAYS update even if null
        existing.setJavaCompleted(updatedTask.getJavaCompleted() != null ? updatedTask.getJavaCompleted() : false);
        existing.setLeetcodeCompleted(
                updatedTask.getLeetcodeCompleted() != null ? updatedTask.getLeetcodeCompleted() : false);
        existing.setDsaCompleted(updatedTask.getDsaCompleted() != null ? updatedTask.getDsaCompleted() : false);
        existing.setSqlCompleted(updatedTask.getSqlCompleted() != null ? updatedTask.getSqlCompleted() : false);
        existing.setProjectCompleted(
                updatedTask.getProjectCompleted() != null ? updatedTask.getProjectCompleted() : false);
        existing.setGithubCompleted(
                updatedTask.getGithubCompleted() != null ? updatedTask.getGithubCompleted() : false);

        // Update notes - ALWAYS update
        existing.setNotes(updatedTask.getNotes() != null ? updatedTask.getNotes() : "");

        // Calculate overall status - now public so we can call it
        existing.calculateOverallStatus();
        
        return dailyTaskRepository.save(existing);
    }
    
    public List<DailyTask> getUserTasks(Long userId) {
        return dailyTaskRepository.findByUserIdOrderByDayAsc(userId);
    }
    
    public DailyTask getUserTaskByDay(Long userId, Integer day) {
        return dailyTaskRepository.findByUserIdAndDay(userId, day)
                .orElseThrow(() -> new RuntimeException("Task not found for day: " + day));
    }
    
    public DailyTask getTaskById(Long taskId) {
        return dailyTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
    }

    @Transactional
    public void initializeTasksForMonth(Long userId, int totalDays) {
        User user = userService.getUserById(userId);
        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        
        for (int day = 1; day <= totalDays; day++) {
            LocalDate date = startDate.plusDays(day - 1);
            DailyTask task = new DailyTask();
            task.setDay(day);
            task.setDate(date);
            task.setUser(user);
            task.setJavaCompleted(false);
            task.setLeetcodeCompleted(false);
            task.setDsaCompleted(false);
            task.setSqlCompleted(false);
            task.setProjectCompleted(false);
            task.setGithubCompleted(false);
            task.setOverallCompleted(false);
            task.setNotes("");
            dailyTaskRepository.save(task);
        }
    }
    
    public ProgressStats getUserProgress(Long userId) {
        ProgressStats stats = new ProgressStats();
        
        List<DailyTask> userTasks = dailyTaskRepository.findByUserIdOrderByDayAsc(userId);
        
        stats.setTotalDays(userTasks.size());
        
        long completedDays = userTasks.stream()
                .filter(t -> t.getOverallCompleted() != null && t.getOverallCompleted())
                .count();
        stats.setCompletedDays((int) completedDays);

        if (userTasks.size() > 0) {
            stats.setCompletionPercentage((double) completedDays / userTasks.size() * 100);
        } else {
            stats.setCompletionPercentage(0.0);
        }

        stats.setJavaCompleted(
                (int) userTasks.stream().filter(t -> t.getJavaCompleted() != null && t.getJavaCompleted()).count());
        stats.setLeetcodeCompleted((int) userTasks.stream()
                .filter(t -> t.getLeetcodeCompleted() != null && t.getLeetcodeCompleted()).count());
        stats.setDsaCompleted(
                (int) userTasks.stream().filter(t -> t.getDsaCompleted() != null && t.getDsaCompleted()).count());
        stats.setSqlCompleted(
                (int) userTasks.stream().filter(t -> t.getSqlCompleted() != null && t.getSqlCompleted()).count());
        stats.setProjectCompleted((int) userTasks.stream()
                .filter(t -> t.getProjectCompleted() != null && t.getProjectCompleted()).count());
        stats.setGithubCompleted(
                (int) userTasks.stream().filter(t -> t.getGithubCompleted() != null && t.getGithubCompleted()).count());

        calculateStreak(stats, userTasks);
        
        return stats;
    }
    
    private void calculateStreak(ProgressStats stats, List<DailyTask> userTasks) {
        int streak = 0;
        for (DailyTask task : userTasks) {
            if (task.getOverallCompleted() != null && task.getOverallCompleted()) {
                streak++;
            } else {
                break;
            }
        }
        stats.setCurrentStreak(streak);
        stats.setBestStreak(streak);
    }
}