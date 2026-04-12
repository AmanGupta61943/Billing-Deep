import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, IconButton } from '@mui/material';
import axiosClient from '../api/axiosClient';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axiosClient.get('/api/bills');
        setBills(response.data);
      } catch (err) {
        setError('Error fetching bill history.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 13, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon /> 
          Bill History
        </Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bills.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography sx={{ color: '#666' }}>No bills found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {bills.map((bill) => (
            <Paper key={bill._id} sx={{ p: 2, borderRadius: 2, border: '1px solid #ebebeb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                  {new Date(bill.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#005745' }}>
                  ₹{bill.totalAmount?.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Items: {bill.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0}
                </Typography>
                <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: '#f4f4f4', fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>
                  {bill.paymentMethod}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default BillHistory;
