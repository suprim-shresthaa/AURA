import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
    Sidebar as SidebarRoot,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    LayoutDashboard,
    LogOut,
    Users,
    Wrench,
    Book,
    CreditCard,
    Car,
    FileText,
    Package,
} from "lucide-react";
import useLogout from "@/hooks/useLogout";

const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "users", label: "Manage Users", icon: Users, href: "/admin/users" },
    { id: "reservations", label: "Reservations", icon: Calendar, href: "/admin/reservations" },
    { id: "applications", label: "Applications", icon: Book, href: "/admin/applications" },
    { id: "vehicles", label: "Manage Vehicles", icon: Car, href: "/admin/vehicles" },
    { id: "licenses", label: "Manage Licenses", icon: FileText, href: "/admin/licenses" },
    { id: "spare-parts", label: "Manage Spare Parts", icon: Wrench, href: "/admin/spare-parts" },
];

const pageMeta = {
    "/admin/dashboard": { title: "Dashboard", subtitle: "Admin" },
    "/admin/users": { title: "Manage Users", subtitle: "User Management" },
    "/admin/reservations": { title: "Reservations", subtitle: "Booking Management" },
    "/admin/applications": { title: "Applications", subtitle: "Vendor Onboarding" },
    "/admin/vehicles": { title: "Manage Vehicles", subtitle: "Vehicle Verification" },
    "/admin/licenses": { title: "Manage Licenses", subtitle: "License Approval" },
    "/admin/spare-parts": { title: "Manage Spare Parts", subtitle: "Parts Management" },
};

const AdminLayout = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const meta = pageMeta[pathname] || { title: "Admin", subtitle: "Control Center" };
    const logout = useLogout();
    
    return (
        <SidebarProvider>
            <div className="flex min-h-screen justify-center items-start w-full">
                <SidebarRoot collapsible="icon" className="border-r">
                    <SidebarHeader className="px-4 py-3">
                        <Link to="/" className="text-lg font-semibold">AURA</Link>
                        <p className="text-xs text-gray-500">Control Center</p>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {adminNavItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.label}
                                                    isActive={pathname === item.href}
                                                >
                                                    <NavLink to={item.href} className="flex tracking-wide  text-lg items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        <span>{item.label}</span>
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <Button
                            onClick={logout}
                            variant="ghost"
                            className="justify-start gap-2 px-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </SidebarFooter>

                    <SidebarRail />
                </SidebarRoot>

                <SidebarInset>
                    <header className="flex h-16 items-center gap-4 border-b px-4">
                        <SidebarTrigger className="md:hidden" />
                        <div>
                            <p className="text-sm text-gray-500">{meta.subtitle}</p>
                            <h1 className="text-xl font-semibold text-gray-900">{meta.title}</h1>
                        </div>
                    </header>

                    <div className="flex-1 w-full  bg-slate-100">
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;

