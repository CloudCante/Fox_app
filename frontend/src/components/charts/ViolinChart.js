// src/components/charts/ViolinPlot.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { Paper, Typography } from '@mui/material';
import * as d3 from 'd3';


/**
 * A simple violin plot component.
 *
 * @param {number[]} data                Array of numeric values
 * @param {number}   [width=400]         SVG total width
 * @param {number}   [height=200]        SVG total height
 * @param {object}   [margin]            { top, right, bottom, left }
 * @param {string}   [label]             Optional title above plot
 */

function kernelEpanechnikov(bandwidth) {
  return v => {
    const x = v / bandwidth;
    return Math.abs(x) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;
  };
}

// Returns a function that, given an array V, returns [ [x, density], ... ] for each x in X
function kernelDensityEstimator(kernel, X) {
  return V => 
    X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
}

export function ViolinChart({ data = [], width = 400, height = 200, margin = { top: 20, right: 20, bottom: 30, left: 40 }, label = '' }) {
  const svgRef = useRef();

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Filter out invalid values
    const validData = data.filter(d => typeof d === 'number' && isFinite(d));
    if (validData.length === 0) return null;

    const min = Math.min(...validData);
    const max = Math.max(...validData);
    
    // Handle edge case where all values are the same
    if (min === max) {
      return {
        data: validData,
        min: min - 1,
        max: max + 1,
        density: [[min, 1]]
      };
    }

    // Calculate bandwidth using Scott's rule or simple heuristic
    const bandwidth = Math.max((max - min) / 20, 0.1);

    
    // Sample points for KDE
    const samplePoints = d3.range(min, max + bandwidth/10, (max - min) / 50);
    
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), samplePoints);
    const density = kde(validData);

    return {
      data: validData,
      min,
      max,
      density: density.filter(d => d[1] > 0) // Remove zero density points
    };
  }, [data]);

  useEffect(() => {
    if (!processedData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Y scale (for the data values)
    const yScale = d3.scaleLinear()
      .domain([processedData.min, processedData.max])
      .range([h, 0])
      .nice();

    // X scale (for the density values)
    const maxDensity = d3.max(processedData.density, d => d[1]) || 1;
    const xScale = d3.scaleLinear()
      .domain([0, maxDensity])
      .range([0, w / 2]);

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Create the violin shape
    const violinArea = d3.area()
      .x0(d => w/2 - xScale(d[1]))
      .x1(d => w/2 + xScale(d[1]))
      .y(d => yScale(d[0]))
      .curve(d3.curveCatmullRom);

    // Add the violin path
    g.append('path')
      .datum(processedData.density)
      .attr('class', 'violin')
      .attr('d', violinArea)
      .attr('fill', '#69b3a2')
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#2c5530')
      .attr('stroke-width', 1);

    // Add center line
    g.append('line')
      .attr('x1', w/2)
      .attr('x2', w/2)
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Add median line if data exists
    const median = d3.median(processedData.data);
    if (median !== undefined) {
      g.append('line')
        .attr('x1', w/2 - w/4)
        .attr('x2', w/2 + w/4)
        .attr('y1', yScale(median))
        .attr('y2', yScale(median))
        .attr('stroke', '#000')
        .attr('stroke-width', 2);
    }

  }, [processedData, width, height, margin]);

  if (!processedData) {
    return (
      <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
        {label && <h3 style={{ margin: '0 0 16px 0' }}>{label}</h3>}
        <p>No valid data to display</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
      {label && <h3 style={{ margin: '0 0 16px 0' }}>{label}</h3>}
      <svg ref={svgRef} />
    </div>
  );
}