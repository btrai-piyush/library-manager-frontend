import './App.css'
import { Provider } from 'react-redux'
import store  from './redux/Store'
import AuthProvider from './context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import router from './routes/Routes'
import Toast from './components/ToastContainer'

function App() {
  return (
    <>
      <Provider store={store}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toast />
        </AuthProvider>
      </Provider>
    </>
  )
}

export default App;