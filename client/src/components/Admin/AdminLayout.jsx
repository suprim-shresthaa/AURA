import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
} from "lucide-react";

const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "users", label: "Manage Users", icon: Users, href: "/admin/users" },
    { id: "reservations", label: "Reservations", icon: Calendar, href: "/admin/reservations" },
    { id: "applications", label: "Applications", icon: Book, href: "/admin/applications" },
    { id: "spare-parts", label: "Spare Parts", icon: Wrench, href: "/admin/add-spare-parts" },
];

const pageMeta = {
    "/admin/dashboard": { title: "Dashboard", subtitle: "Admin" },
    "/admin/users": { title: "Manage Users", subtitle: "User Management" },
    "/admin/reservations": { title: "Reservations", subtitle: "Booking Management" },
    "/admin/applications": { title: "Applications", subtitle: "Vendor Onboarding" },
    "/admin/add-spare-parts": { title: "Spare Parts", subtitle: "Inventory" },
};

const AdminLayout = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const meta = pageMeta[pathname] || { title: "Admin", subtitle: "Control Center" };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen justify-center items-start w-full">
                <SidebarRoot collapsible="icon" className="border-r">
                    <SidebarHeader className="px-4 py-3">
                        <p className="text-lg font-semibold">AURA Admin</p>
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
                            variant="ghost"
                            className="justify-start gap-2 px-2 text-sidebar-foreground hover:text-sidebar-accent-foreground"
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

