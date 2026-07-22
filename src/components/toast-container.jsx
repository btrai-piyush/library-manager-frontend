import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toast() {
  return (
    <ToastContainer
    position="top-right"
    className="mt-15"
    autoClose={3000}
    />
  );
}