import { FC } from 'react';
import { ConstructorPage, Feed, Login, Register, ForgotPassword, ResetPassword, Profile, ProfileOrders, NotFound404 } from '@pages';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import '../../index.css';
import styles from './app.module.css';
import { AppHeader, Modal, OrderInfo, IngredientDetails, ProtectedRoute } from '@components';
import { WebSocketProvider } from '../../providers/websocket-provider';

const ModalWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Modal title="" onClose={handleClose}>
      {children}
    </Modal>
  );
};

const App: FC = () => (
  <Router>
    <WebSocketProvider>
      <div className={styles.app}>
        <AppHeader />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ConstructorPage />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feed/:number" element={
            <ModalWrapper>
              <OrderInfo />
            </ModalWrapper>
          } />
          <Route path="/ingredients/:id" element={
            <ModalWrapper>
              <IngredientDetails />
            </ModalWrapper>
          } />

          {/* Protected routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/orders" element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          } />
          <Route path="/profile/orders/:number" element={
            <ProtectedRoute>
              <ModalWrapper>
                <OrderInfo />
              </ModalWrapper>
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </div>
    </WebSocketProvider>
  </Router>
);

export default App;
