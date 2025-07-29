import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function BoxChart({
  data = [],
  width = 400,
  height = 120,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  isVertical = false,
  color = '#1976d2',
  label,
  ticks = 5,
}) {
  const svgRef = useRef();
  const theme = useTheme();

    // Sort and compute quartiles
    const { q1, median, q3, min, max } = useMemo(() => {
      if (!data.length) return {};
      const s = data.slice().sort(d3.ascending);
      return {
        q1:     d3.quantile(s, 0.25),
        median: d3.quantile(s, 0.5),
        q3:     d3.quantile(s, 0.75),
        min:    d3.min(s),
        max:    d3.max(s)
      };
    }, [data]);

    const [innerWidth, innerHeight] = useMemo(() => [
      width - margin.left - margin.right,
      height - margin.top - margin.bottom
    ], [width, height, margin]);

    // Scales
    const x = useMemo(() => {
      if (min == null || max == null) return null;
      return d3.scaleLinear()
        .domain([min, max])
        .range(isVertical ? [0, innerHeight] : [0, innerWidth]);
    }, [isVertical, min, max, innerWidth, innerHeight]);

  useEffect(() => {
    if (!x) return;
    // Prepare SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Whiskers
    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 : x(min))
      .attr('x2', isVertical ? innerWidth / 2 : x(q1))
      .attr('y1', isVertical ? x(min) : innerHeight / 2)
      .attr('y2', isVertical ? x(q1) : innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 : x(q3))
      .attr('x2', isVertical ? innerWidth / 2 : x(max))
      .attr('y1', isVertical ? x(q3) : innerHeight / 2)
      .attr('y2', isVertical ? x(max) : innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    // Box
    g.append('rect')
      .attr('x', isVertical ? innerWidth / 2 - 20 : x(q1))
      .attr('y', isVertical ? x(q1) : innerHeight / 2 - 20)
      .attr('width', isVertical ? 40 : x(q3) - x(q1))
      .attr('height', isVertical ? x(q3) - x(q1) :  40)
      .attr('fill', color)
      .attr('opacity', 0.7)
      .attr('stroke', theme.palette.text.primary)
      .attr('stroke-width', 1);

    // Median line
    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 - 20 : x(median))
      .attr('x2', isVertical ? innerWidth / 2 + 20 : x(median))
      .attr('y1', isVertical ? x(median) : innerHeight / 2 - 20)
      .attr('y2', isVertical ? x(median) : innerHeight / 2 + 20)
      .attr('stroke', theme.palette.text.primary);

    // Caps
    [min, max].forEach(d => {
      g.append('line')
        .attr('x1', isVertical ? innerWidth / 2 - 10 : x(d))
        .attr('x2', isVertical ? innerWidth / 2 + 10 :x(d))
        .attr('y1', isVertical ? x(d) : innerHeight / 2 - 10)
        .attr('y2', isVertical ? x(d) : innerHeight / 2 + 10)
        .attr('stroke', theme.palette.text.primary);
    });

    // Axis Label
    isVertical ? 
        g.append('g')
        .attr('transform', `translate(0,0)`)
        .call(d3.axisLeft(x).ticks(ticks).tickFormat(d => d.toFixed(2))): 
        g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(ticks).tickFormat(d => d.toFixed(2)));

  }, [data, width, height, margin]);

  return (
    <Box style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
      <Typography variant="h6" gutterBottom color={theme.palette.text.primary}>
        {label}
      </Typography>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ background: theme.palette.background.paper }}
      />
    </Box>
  );
}
