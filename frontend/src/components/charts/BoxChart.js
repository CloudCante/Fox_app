import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function BoxChart({
  data = [],
  width = 400,
  height = 120,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  label,
}) {
  const svgRef = useRef();
  const theme = useTheme();
  useEffect(() => {
    if (data.length === 0) return;

    // Sort and compute quartiles
    const sorted = data.slice().sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const min = d3.min(sorted);
    const max = d3.max(sorted);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const x = d3.scaleLinear()
      .domain([min, max])
      .range([0, innerWidth]);

    // Prepare SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Whiskers
    g.append('line')
      .attr('x1', x(min))
      .attr('x2', x(q1))
      .attr('y1', innerHeight / 2)
      .attr('y2', innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    g.append('line')
      .attr('x1', x(q3))
      .attr('x2', x(max))
      .attr('y1', innerHeight / 2)
      .attr('y2', innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    // Box
    g.append('rect')
      .attr('x', x(q1))
      .attr('y', innerHeight / 2 - 20)
      .attr('width', x(q3) - x(q1))
      .attr('height', 40)
      .attr('fill', '#1976d2')
      .attr('opacity', 0.5)
      .attr('stroke', theme.palette.text.primary);

    // Median line
    g.append('line')
      .attr('x1', x(median))
      .attr('x2', x(median))
      .attr('y1', innerHeight / 2 - 20)
      .attr('y2', innerHeight / 2 + 20)
      .attr('stroke', theme.palette.text.primary);

    // Caps
    [min, max].forEach(d => {
      g.append('line')
        .attr('x1', x(d))
        .attr('x2', x(d))
        .attr('y1', innerHeight / 2 - 10)
        .attr('y2', innerHeight / 2 + 10)
        .attr('stroke', theme.palette.text.primary);
    });

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5));

  }, [data, width, height, margin]);

  return (
    <Box>
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
