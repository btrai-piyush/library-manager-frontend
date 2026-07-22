import './App.css'
import { Provider } from 'react-redux'
import store  from './redux/store'
import AuthProvider from './context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import Toast from './components/toast-container'

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