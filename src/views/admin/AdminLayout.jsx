import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <>
        <h1>Admin Dashboard</h1>
            <main>
                <Outlet />
            </main>
        </>
    );
}