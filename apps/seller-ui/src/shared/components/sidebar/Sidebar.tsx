"use client";

import useSeller from "apps/seller-ui/src/hooks/useSeller";
import useSidebar from "apps/seller-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./Sidebar.styles";
import Link from "next/link";
import { BarChart, BellPlus, BellRing, CalendarPlus, Headset, Home, LayoutDashboard, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent, WalletCards } from "lucide-react";
import SidebarItems from "./Sidebar.items";
import SidebarMenu from "./Sidebar.menu";
import DashboardSvg from "apps/seller-ui/src/assets/dashboard";

const SidebarWrapper = () => {
    const { activeSidebar, setactivesidebar } = useSidebar();
    const pathName = usePathname();
    const { seller } = useSeller();

    useEffect(() => {
        setactivesidebar(pathName);
    }, [pathName, setactivesidebar]);

    const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696"
    return (
        <Box css={{
            height: "100vh",
            zIndex: 202,
            position: "sticky",
            padding: "8px",
            top: "0",
            overflowY: "scroll",
            scrollbarWidth: "none",
        }} className="sidebar-wrapper">
            <Sidebar.header>
                <Box>
                    <Link href={"/"} className="flex justify-center items-center text-start gap-2">
                        <BarChart className="text-[#0085ff] w-6 h-6" />
                        <Box>
                            <h3 className="text-xl font-medium text-[#ecedee]">{seller?.shop?.name}</h3>
                            <h5 className="text-xs  font-medium text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                                {seller?.shop?.address}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </Sidebar.header>
            <div>
                <Sidebar.body className="body slider">
                    <SidebarItems
                        title="Dashboard"
                        icon={<LayoutDashboard width={24} height={24} fill={getIconColor("/dashboard")} />}
                        href="/dashboard"
                        isActive={activeSidebar === "/dashboard"} />
                    <div className="mt-2 block">
                        <SidebarMenu title="Main Menu">
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/orders"}
                                title="Orders"
                                href="/dashboard/orders"
                                icon={<ListOrdered size={24} color={getIconColor("/darshboard/orders")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/payments"}
                                title="Payments"
                                href="/dashboard/payments"
                                icon={<WalletCards size={24} color={getIconColor("/darshboard/payments")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Products">
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/create-product"}
                                title="Create Product"
                                href="/dashboard/create-product"
                                icon={<SquarePlus size={24} color={getIconColor("/darshboard/create-product")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/all-products"}
                                title="All Products"
                                href="/dashboard/all-products"
                                icon={<PackageSearch size={24} color={getIconColor("/darshboard/all-products")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Events">
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/create-event"}
                                title="Create Event"
                                href="/dashboard/create-event"
                                icon={<CalendarPlus size={24} color={getIconColor("/darshboard/create-event")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/all-events"}
                                title="All Events"
                                href="/dashboard/all-events"
                                icon={<BellPlus size={24} color={getIconColor("/darshboard/all-events")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Controllers">
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/inbox"}
                                title="Inbox"
                                href="/dashboard/inbox"
                                icon={<Mail size={24} color={getIconColor("/darshboard/inbox")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/settings"}
                                title="Settings"
                                href="/dashboard/settings"
                                icon={<Settings size={24} color={getIconColor("/darshboard/settings")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/notifications"}
                                title="Notifications"
                                href="/dashboard/notifications"
                                icon={<BellRing size={24} color={getIconColor("/darshboard/notifications")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Extras">
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/discount-codes"}
                                title="Discount Codes"
                                href="/dashboard/discount-codes"
                                icon={<TicketPercent size={22} color={getIconColor("/darshboard/discount-codes")} />}
                            /> 
                            <SidebarItems
                                isActive={activeSidebar === "/dashboard/logout"}
                                title="Logout"
                                href="/dashboard/logout"
                                icon={<LogOut size={22} color={getIconColor("/darshboard/logout")} />}
                            /> 
                        </SidebarMenu>
                    </div>
                </Sidebar.body>
            </div>
        </Box>
    );
}
export default SidebarWrapper;