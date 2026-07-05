import { NavLink } from "react-router-dom";
import {useSelector,useDispatch} from "react-redux";
import { toggleSidebar } from "../../redux/sidebarSlice";

export default function Sidebar({ navlinks }) {
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);

    return (
        <aside
            className={`hidden md:block fixed left-0 top-[64px] z-40 h-[calc(100vh-64px)] w-[250px] overflow-y-auto overflow-x-hidden border-r border-[#25385c] bg-[#1c2d4c] text-white transition-transform duration-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:top-[70px] md:h-[calc(100vh-70px)]`}
        >
            <nav className="py-1">
                {navlinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `block px-4 py-3 text-[15px] font-medium tracking-wide transition-colors border-b border-[#2a3f67] last:border-b-0 ${
                                isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-[#7f92b7] hover:bg-[#2a3f67] hover:text-white'
                            }`
                        }
                    >
                        {link.title}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}