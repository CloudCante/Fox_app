import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Collapse } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

// Only show in development mode
const isDev = process.env.NODE_ENV === 'development';

/**
 * A simplified performance monitor that doesn't patch React internals
 * Only visible in development mode
 */
export const SimplePerformanceMonitor = () => {
  // Skip rendering in production
  if (!isDev) return null;

  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    lastLagDuration: 0,
  });

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // Toggle visibility
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Toggle expanded state
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    } else {
      setIsRecording(true);
    }
  };

  // Clear metrics
  const clearMetrics = () => {
    setMetrics({
      fps: 0,
      memory: 0,
      lastLagDuration: 0,
    });
    frameCountRef.current = 0;
  };

  // Start performance recording
  const startRecording = () => {
    // Start counting frames for FPS
    const updateMetrics = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastFrameTimeRef.current;

      // Update metrics every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);

        // Get memory usage if available
        let memory = 0;
        if (window.performance && window.performance.memory) {
          memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        }

        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
        }));

        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }

      // Check for large gaps between frames (lag)
      if (elapsed > 50) { // Anything over 50ms is considered lag (less than 20fps)
        setMetrics(prev => ({
          ...prev,
          lastLagDuration: Math.round(elapsed)
        }));
      }

      rafIdRef.current = requestAnimationFrame(updateMetrics);
    };

    rafIdRef.current = requestAnimationFrame(updateMetrics);
  };

  // Start recording when isRecording changes
  useEffect(() => {
    if (isRecording) {
      startRecording();

      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const fpsColor = metrics.fps > 55 ? 'success.main' :
    metrics.fps > 30 ? 'warning.main' : 'error.main';

  const memoryColor = metrics.memory < 100 ? 'success.main' :
    metrics.memory < 200 ? 'warning.main' : 'error.main';

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: isVisible && isExpanded ? 250 : 150, // Set narrow width when minimized
        width: !isVisible ? 150 : 'auto',              // Force width when minimized
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        transition: 'all 0.3s ease',
        p: 0 // Remove extra Paper padding when minimized
      }}
    >
      {!isVisible ? (
        <IconButton
          color="primary"
          onClick={toggleVisibility}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            width: 28,    // Make the button more narrow
            height: 28,   // Make the button more compact
            minWidth: 0,
            minHeight: 0,
            p: 0          // Remove extra padding
          }}
        >
          <SpeedIcon fontSize="small" />
        </IconButton>
      ) : (
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
              Simple Performance Monitor
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={toggleExpanded}
                sx={{ color: 'white', p: 0.5 }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={toggleVisibility}
                sx={{ color: 'white', p: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .5, px: 0.5 }}>
            <Typography variant="body2" component="div" color={fpsColor}>
              FPS: {metrics.fps}
            </Typography>
            <Typography variant="body2" component="div" color={memoryColor}>
              Memory: {metrics.memory} MB
            </Typography>
          </Box>

          {metrics.lastLagDuration > 0 && (
            <Typography variant="body2" component="div" color="error.main" sx={{ mb: 1 }}>
              Last lag: {metrics.lastLagDuration}ms
            </Typography>
          )}

          <Collapse in={isExpanded}>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              • This is a simplified monitor that only tracks FPS and memory
            </Typography>
            <Typography variant="body2" component="div">
              • For detailed profiling, use React DevTools Profiler
            </Typography>
            <Typography variant="body2" component="div">
              • For component renders, check browser console
            </Typography>
          </Collapse>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton
              size="small"
              onClick={toggleRecording}
              sx={{ color: isRecording ? 'error.main' : 'success.main', p: 0.5 }}
            >
              {isRecording ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>

            <Typography
              variant="caption"
              component="div"
              onClick={clearMetrics}
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                alignSelf: 'center',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Clear
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};