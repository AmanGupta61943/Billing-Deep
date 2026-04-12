import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';

// Import icons
import QrCodeIcon from '@mui/icons-material/QrCode';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

// Import components
import Header from './components/Header';
import BarcodeGenerator from './components/Barcode';
import StockManagement from './components/StockManagement';
import EditProduct from './components/EditProduct';
import NewBill from './components/NewBill';
import AddProduct from './components/AddProduct';
import SplashScreen from './components/SplashScreen';
import BillingDeepLogin from './components/BillingDeepLogin';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';
import BillHistory from './components/BillHistory';
import PrinterConnection from './components/PrinterConnection';
import BillCustomization from './components/BillCustomization';
import ContactUs from './components/ContactUs';
import { getStoredAuth, clearAuth } from './utils/auth';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const menuItems = [
  { title: 'Stock Management', icon: <InventoryIcon />, path: '/stock' },
  { title: 'Bill History', icon: <HistoryIcon />, path: '/bill-history' },
  { title: 'Barcode Generate', icon: <QrCodeIcon />, path: '/barcode' },
  { title: 'Printer Connection', icon: <PrintIcon />, path: '/printer' },
  { title: 'Bill Customization', icon: <SettingsIcon />, path: '/customize' },
  { title: 'Contact Us', icon: <ContactSupportIcon />, path: '/contact' },
];

function Home() {
  const newBillItem = {
    title: 'New Bill',
    icon: <ReceiptIcon sx={{ fontSize: 64 }} />,
    path: '/new-bill',
  };

  const cardRadius = 2.5;
  // Fixed height so every feature card is identical on mobile (thumb-friendly tap targets).
  const featureCardHeight = 120;
  const cardPadding = 2;

  const linkSx = {
    display: 'block',
    width: '100%',
    height: '100%',
  };

  const cardSx = {
    p: cardPadding,
    height: featureCardHeight,
    minHeight: featureCardHeight,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: cardRadius,
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
    '&:hover': {
      boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0px) scale(0.99)',
    },
  };

  return (
    <Container maxWidth="md" disableGutters={false} sx={{ mt: 2, mb: 4, px: { xs: 2, sm: 2.5 }, pb: 13 }}>
      <Box sx={{ px: 0, mt: 0 }}>
        <Box sx={{ mx: 'auto', width: '100%', maxWidth: 500 }}>
          <Link href={newBillItem.path} underline="none" sx={{ display: 'block', width: '100%' }}>
            <Paper
              sx={{
                cursor: 'pointer',
                width: '100%',
                minHeight: 100,
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#ffffff',
                borderRadius: 3,
                boxShadow: '0 10px 24px rgba(6, 182, 212, 0.28)',
                transition: 'transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease',
                '&:hover': {
                  opacity: 0.96,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 14px 28px rgba(6, 182, 212, 0.32)',
                },
                '&:active': {
                  transform: 'translateY(0px) scale(0.99)',
                },
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: 32, sm: 30 },
                  fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 700,
                  lineHeight: 1.05,
                }}
              >
                {newBillItem.title}
              </Typography>
              {React.cloneElement(newBillItem.icon, { sx: { fontSize: 52, color: '#ffffff' } })}
            </Paper>
          </Link>
        </Box>
      </Box>

      <Box sx={{ mt: 2, mx: 'auto', width: '100%', maxWidth: 760 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 1.5,
            width: '100%',
          }}
        >
          {menuItems.map((item) => (
            <Box key={item.title} sx={{ minWidth: 0 }}>
              <Link href={item.path} underline="none" sx={linkSx}>
                <Paper
                  sx={{
                    ...cardSx,
                    cursor: 'pointer',
                    bgcolor: '#ffffff',
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: 30, color: '#252525' } })}
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{
                      mt: 1,
                      textAlign: 'center',
                      color: '#202020',
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      px: 0.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                </Paper>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

function MyProfile() {
  const navigate = useNavigate();
  const { user } = getStoredAuth();

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 13 }}>
      <Typography
        component="h2"
        sx={{ fontWeight: 700, mb: 1.5, fontSize: 24, fontFamily: '"Poppins", "Inter", sans-serif' }}
      >
        My Profile
      </Typography>
      {user && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
          <Typography sx={{ fontWeight: 700 }}>{user.name || 'User'}</Typography>
          <Typography sx={{ color: '#666', fontSize: 14 }}>{user.email || ''}</Typography>
        </Paper>
      )}

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: 3,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: 16,
          boxShadow: '0 4px 14px rgba(220, 0, 78, 0.3)',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(220, 0, 78, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          }
        }}
      >
        Logout
      </Button>
    </Container>
  );
}

function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/dashboard';
  const isMy = location.pathname === '/my-profile';

  const itemSx = (active) => ({
    cursor: 'pointer',
    width: '34%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#2b2b2b' : '#8f8f8f',
    transition: 'color 180ms ease',
    fontFamily: '"Poppins", "Inter", sans-serif',
    userSelect: 'none',
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        px: 1.5,
        pb: 1,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          height: 72,
          bgcolor: '#ffffff',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          boxShadow: '0 -8px 28px rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.4,
          overflow: 'visible',
          animation: 'navFadeIn 220ms ease',
          '@keyframes navFadeIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 96,
            height: 58,
            background: '#f5f5f5',
            borderBottomLeftRadius: 52,
            borderBottomRightRadius: 52,
          },
        }}
      >
        <Box onClick={() => navigate('/dashboard')} sx={itemSx(isHome)}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 0.2 }}>Home</Typography>
        </Box>

        <Box onClick={() => navigate('/my-profile')} sx={itemSx(isMy)}>
          <PersonOutlineIcon sx={{ fontSize: 24 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 0.2 }}>My</Typography>
        </Box>

        <Box
          role="button"
          tabIndex={0}
          onClick={() => navigate('/stock/add')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/stock/add');
            }
          }}
          sx={{
            position: 'absolute',
            right: 34,
            top: -22,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #26c281 0%, #20b173 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 18px rgba(32,177,115,0.38)',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform 140ms ease, box-shadow 180ms ease',
            '&:active': {
              transform: 'scale(0.94)',
              boxShadow: '0 5px 12px rgba(32,177,115,0.35)',
            },
          }}
          aria-label="Add product"
        >
          <AddIcon sx={{ fontSize: 22 }} />
        </Box>

        <Box
          role="button"
          tabIndex={0}
          onClick={() => navigate('/new-bill')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/new-bill');
            }
          }}
          sx={{
            position: 'absolute',
            left: '50%',
            top: -24,
            transform: 'translateX(-50%)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e3ad14 0%, #ffd84d 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 24px rgba(227,173,20,0.45), 0 0 16px rgba(255,216,77,0.5)',
            cursor: 'pointer',
            outline: 'none',
            transition: 'transform 140ms ease, box-shadow 180ms ease',
            '&:active': {
              transform: 'translateX(-50%) scale(0.95)',
              boxShadow: '0 8px 18px rgba(227,173,20,0.42)',
            },
          }}
        >
          <QrCodeScannerIcon sx={{ fontSize: 34 }} />
        </Box>
      </Box>
    </Box>
  );
}

function AppLayout({
  scannedItems,
  addItemToBill,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearScannedItems,
}) {
  const location = useLocation();

  const hideHeaderRoutes = ['/', '/auth', '/signin', '/signup'];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);
  const hideBottomNavRoutes = ['/', '/auth', '/signin', '/signup'];
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!shouldHideHeader && <Header />}
      <Box component="main" sx={{ flexGrow: 1, px: 0, pt: shouldHideHeader ? 1 : '60px', pb: shouldHideBottomNav ? 0 : '88px' }}>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<BillingDeepLogin />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barcode"
            element={
              <ProtectedRoute>
                <BarcodeGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <StockManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/edit/:id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/add"
            element={
              <ProtectedRoute>
                <AddProduct addItemToBill={addItemToBill} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-bill"
            element={
              <ProtectedRoute>
                <NewBill
                  scannedItems={scannedItems}
                  addItemToBill={addItemToBill}
                  increaseItemQuantity={increaseItemQuantity}
                  decreaseItemQuantity={decreaseItemQuantity}
                  clearScannedItems={clearScannedItems}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/bill-history" element={<ProtectedRoute><BillHistory /></ProtectedRoute>} />
          <Route path="/printer" element={<ProtectedRoute><PrinterConnection /></ProtectedRoute>} />
          <Route path="/customize" element={<ProtectedRoute><BillCustomization /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
        </Routes>
      </Box>
      {!shouldHideBottomNav && <BottomNavBar />}
    </Box>
  );
}

function App() {
  const [scannedItems, setScannedItems] = useState([]);

  // Log scannedItems state whenever it changes
  useEffect(() => {
    console.log('App.js - scannedItems state updated:', scannedItems);
  }, [scannedItems]);

  const addItemToBill = (product) => {
    setScannedItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const increaseItemQuantity = (itemId) => {
    setScannedItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseItemQuantity = (itemId) => {
    setScannedItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearScannedItems = () => {
    setScannedItems([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout
          scannedItems={scannedItems}
          addItemToBill={addItemToBill}
          increaseItemQuantity={increaseItemQuantity}
          decreaseItemQuantity={decreaseItemQuantity}
          clearScannedItems={clearScannedItems}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
