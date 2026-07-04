import { Outlet } from "react-router-dom";

export default function UserLayout() {
    return (
        <>
        <h1>User Dashboard</h1>
            <main>
                <Outlet />
            </main>
        </>
    );
}