import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

function BarcodeGenerator() {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const barcodeRef = React.useRef();

  const handleGenerate = () => {
    if (barcodeValue.trim()) {
      setGeneratedBarcode(barcodeValue);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current,
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Barcode Generator
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Barcode Value"
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleGenerate}
            sx={{ mt: 2 }}
          >
            Generate Barcode
          </Button>
        </Box>

        {generatedBarcode && (
          <Box
            ref={barcodeRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
            }}
          >
            <Barcode value={generatedBarcode} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {generatedBarcode}
            </Typography>
            <Button
              variant="outlined"
              onClick={handlePrint}
              sx={{ mt: 2 }}
            >
              Print Barcode
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default BarcodeGenerator; 