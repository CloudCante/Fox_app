import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Button,
  Alert,
  Input
} from '@mui/material';

const PostgresTablesPage = () => {
  const [testboardData, setTestboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadError(null);
      setUploadResponse(null);
      
      const response = await fetch('/api/test/catch-file', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || 'Upload failed');
      
      setUploadResponse(result);
      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/testboard/testboard-data');
        if (!response.ok) throw new Error('Failed to fetch testboard data');
        const data = await response.json();
        setTestboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* File Upload Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test File Upload
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Input
            type="file"
            onChange={handleFileUpload}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        
        {/* Show upload response or error */}
        {uploadResponse && (
          <Alert severity="success" sx={{ mt: 2 }}>
            File uploaded successfully! Content: {uploadResponse.content}
          </Alert>
        )}
        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Upload failed: {uploadError}
          </Alert>
        )}
      </Paper>

      <Typography variant="h4" gutterBottom>
        Testboard Data Preview
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>Part Number</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Workstation</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Operator</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testboardData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.sn}</TableCell>
                <TableCell>{row.pn}</TableCell>
                <TableCell>{row.model}</TableCell>
                <TableCell>{row.workstation_name}</TableCell>
                <TableCell>{new Date(row.history_station_start_time).toLocaleString()}</TableCell>
                <TableCell>{new Date(row.history_station_end_time).toLocaleString()}</TableCell>
                <TableCell>{row.history_station_passing_status}</TableCell>
                <TableCell>{row.operator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PostgresTablesPage;