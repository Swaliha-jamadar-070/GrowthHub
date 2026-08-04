package com.roadmap.repository;

import com.roadmap.model.WeekFocus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeekFocusRepository extends JpaRepository<WeekFocus, Long> {
    List<WeekFocus> findAllByOrderByWeekAsc();
    
    // ✅ ADD THIS METHOD - Fix for Error 1
    Optional<WeekFocus> findByWeek(Integer week);
}