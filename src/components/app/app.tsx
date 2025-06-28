import { FC, useEffect } from 'react';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from 'react-router-dom';
import '../../index.css';
import styles from './app.module.css';
import {
  AppHeader,
  Modal,
  OrderInfo,
  IngredientDetails,
  ProtectedRoute
} from '@components';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { getUser } from '../../services/slices/auth-slice';

const ModalWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Modal title='' onClose={handleClose}>
      {children}
    </Modal>
  );
};

const AppContent: FC = () => {
  const location = useLocation();
  const background = location.state?.background;
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  // Автологин при загрузке приложения (только один раз)
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!user && !loading && refreshToken) {
      dispatch(getUser());
    }
  }, []); // Пустой массив зависимостей - запускается только один раз

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        {/* Public routes */}
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />

        {/* Detail pages */}
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route path='/ingredients/:id' element={<IngredientDetails />} />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderInfo />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {/* Modal routes - only show when there's a background */}
      {background && (
        <Routes>
          <Route
            path='/feed/:number'
            element={
              <ModalWrapper>
                <OrderInfo />
              </ModalWrapper>
            }
          />
          <Route
            path='/ingredients/:id'
            element={
              <ModalWrapper>
                <IngredientDetails />
              </ModalWrapper>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <ModalWrapper>
                  <OrderInfo />
                </ModalWrapper>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

const App: FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
