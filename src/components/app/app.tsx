import { FC, useEffect, useRef } from 'react';
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
import { fetchIngredients } from '../../services/slices/ingredients-slice';
import { fetchFeeds } from '../../services/slices/feed-slice';
import { getUser } from '../../services/slices/auth-slice';

const ModalWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const handleClose = () => navigate(-1);
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
  const { items: ingredients, loading: ingredientsLoading } = useAppSelector(
    (state) => state.ingredients
  );
  const { orders: feeds, loading: feedsLoading } = useAppSelector(
    (state) => state.feed
  );
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  const ingredientsRequested = useRef(false);
  const feedsRequested = useRef(false);
  const authRequested = useRef(false);

  useEffect(() => {
    if (!user && !authLoading && !authRequested.current) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        authRequested.current = true;
        dispatch(getUser());
      }
    }
  }, [dispatch, user, authLoading]);

  useEffect(() => {
    if (
      !ingredients?.length &&
      !ingredientsLoading &&
      !ingredientsRequested.current
    ) {
      ingredientsRequested.current = true;
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients?.length, ingredientsLoading]);

  useEffect(() => {
    if (!feeds?.length && !feedsLoading && !feedsRequested.current) {
      feedsRequested.current = true;
      dispatch(fetchFeeds());
    }
  }, [dispatch, feeds?.length, feedsLoading]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
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
        {!background && (
          <>
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
          </>
        )}
        <Route path='*' element={<NotFound404 />} />
      </Routes>
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
