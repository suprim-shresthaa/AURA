import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Wrench,
  Car,
  Activity,
  DollarSign,
  Clock3,
  CheckCircle2,
  Package,
} from "lucide-react";
import { fetchAdminStats } from "@/data/api";
import Loading from "@/components/Loading";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const HorizontalBar = ({ label, value, max, colorClass = "bg-indigo-500" }) => {
  const safeMax = max > 0 ? max : 1;
  const widthPercent = Math.min((value / safeMax) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const metrics = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      subtitle: "Registered customers and vendors",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: Calendar,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      subtitle: `${stats.confirmedBookings || 0} confirmed, ${stats.pendingBookings || 0} pending`,
    },
    {
      title: "Available Vehicles",
      value: stats.availableVehicles || 0,
      icon: Car,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      subtitle: `${stats.totalVehicles || 0} total listed vehicles`,
    },
    {
      title: "Available Spare Parts",
      value: stats.availableSpareParts || 0,
      icon: Wrench,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      subtitle: "Current in-stock rentable items",
    },
    {
      title: "Vehicle rental revenue",
      value: formatCurrency(stats.totalVehicleRevenue),
      icon: Car,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-700",
      subtitle: `${formatCurrency(stats.monthlyVehicleRevenue || 0)} this month · all-time paid bookings`,
    },
    {
      title: "Spare parts revenue",
      value: formatCurrency(stats.totalSparePartRevenue),
      icon: Package,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-700",
      subtitle: `${formatCurrency(stats.monthlySparePartRevenue || 0)} this month · all-time paid bookings`,
    },
  ];

  const bookingStatusItems = [
    {
      key: "confirmed",
      label: "Confirmed",
      value: stats.confirmedBookings || 0,
      color: "#10B981",
      dot: "bg-emerald-500",
    },
    {
      key: "active",
      label: "Active",
      value: stats.activeBookings || 0,
      color: "#3B82F6",
      dot: "bg-blue-500",
    },
    {
      key: "pending",
      label: "Pending",
      value: stats.pendingBookings || 0,
      color: "#F59E0B",
      dot: "bg-amber-500",
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completedBookings || 0,
      color: "#8B5CF6",
      dot: "bg-violet-500",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: stats.cancelledBookings || 0,
      color: "#EF4444",
      dot: "bg-red-500",
    },
  ];
  const totalBookingStates = bookingStatusItems.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  const pieSegments = bookingStatusItems
    .filter((item) => item.value > 0)
    .map((item) => `${item.color}`)
    .join(", ");

  const pieStops = (() => {
    let running = 0;
    return bookingStatusItems
      .filter((item) => item.value > 0)
      .map((item) => {
        const start = totalBookingStates
          ? (running / totalBookingStates) * 100
          : 0;
        running += item.value;
        const end = totalBookingStates
          ? (running / totalBookingStates) * 100
          : 0;
        return `${item.color} ${start}% ${end}%`;
      })
      .join(", ");
  })();

  const bookingDonutStyle = {
    background:
      totalBookingStates > 0
        ? `conic-gradient(${pieStops})`
        : "conic-gradient(#e5e7eb 0% 100%)",
  };

  const monthlyData = stats.monthlyBreakdown || [];
  const maxMonthlyRevenue = monthlyData.reduce(
    (acc, item) => Math.max(acc, item.revenue || 0),
    0,
  );

  const vendorMaxRevenue = (stats.topVendors || []).reduce(
    (acc, vendor) => Math.max(acc, vendor.revenue || 0),
    0,
  );

  const paymentStatusMax = Math.max(
    stats.paidBookings || 0,
    stats.pendingPayments || 0,
    stats.refundedPayments || 0,
    1,
  );

  return (
    <div className="p-8 min-h-screen">
      <div className="w-full mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-indigo-50 px-3 py-2 rounded-lg min-w-[10rem]">
              <p className="text-xs text-indigo-700 font-medium">
                Today (paid)
              </p>
              <p className="text-sm font-bold text-indigo-900">
                {formatCurrency(stats.todayRevenue)}
              </p>
              <p className="text-[11px] text-indigo-600 mt-1 leading-snug">
                Vehicles {formatCurrency(stats.todayVehicleRevenue || 0)} ·
                Spare {formatCurrency(stats.todaySparePartRevenue || 0)}
              </p>
            </div>
            <div className="bg-emerald-50 px-3 py-2 rounded-lg min-w-[10rem]">
              <p className="text-xs text-emerald-700 font-medium">
                eSewa (paid)
              </p>
              <p className="text-sm font-bold text-emerald-900">
                {formatCurrency(stats.esewaRevenue)}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 leading-snug">
                Vehicles {formatCurrency(stats.esewaVehicleRevenue || 0)} ·
                Spare {formatCurrency(stats.esewaSparePartRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {metrics.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              iconBg={metric.iconBg}
              iconColor={metric.iconColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Monthly Revenue Trend
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600 shrink-0" />
                  Vehicles
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                  Spare parts
                </span>
              </div>
            </div>

            {monthlyData.length > 0 ? (
              <div>
                <div className="h-64 grid grid-cols-6 items-end gap-3 md:gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  {monthlyData.map((item) => {
                    const combined = item.revenue || 0;
                    const vRev =
                      item.vehicleRevenue !== undefined &&
                      item.sparePartRevenue !== undefined
                        ? item.vehicleRevenue
                        : combined;
                    const sRev =
                      item.sparePartRevenue !== undefined
                        ? item.sparePartRevenue
                        : 0;
                    const heightPercent = maxMonthlyRevenue
                      ? Math.max((combined / maxMonthlyRevenue) * 100, 4)
                      : 4;
                    const vehiclePct =
                      combined > 0 ? (vRev / combined) * 100 : 0;
                    const sparePct = combined > 0 ? (sRev / combined) * 100 : 0;
                    const tip = `${item.month}: ${formatCurrency(combined)} total (${item.bookings || 0} paid) · vehicles ${formatCurrency(vRev)}, spare ${formatCurrency(sRev)}`;
                    return (
                      <div
                        key={item.month}
                        className="h-full flex flex-col justify-end items-center gap-1"
                      >
                        <div
                          className="w-full max-w-12 rounded-t-md overflow-hidden border border-indigo-200/60 bg-white shadow-sm flex flex-col"
                          style={{ height: `${heightPercent}%` }}
                          title={tip}
                        >
                          {combined > 0 ? (
                            <>
                              {sparePct > 0 && (
                                <div
                                  className="w-full shrink-0 bg-amber-500 min-h-[4px]"
                                  style={{ height: `${sparePct}%` }}
                                />
                              )}
                              {vehiclePct > 0 && (
                                <div
                                  className="w-full shrink-0 bg-indigo-600 min-h-[4px]"
                                  style={{ height: `${vehiclePct}%` }}
                                />
                              )}
                            </>
                          ) : (
                            <div className="w-full h-1 bg-gray-200 shrink-0 mt-auto" />
                          )}
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-600 mt-2 text-center">
                          {item.month}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {monthlyData.map((item) => {
                    const vRev = item.vehicleRevenue ?? item.revenue ?? 0;
                    const sRev = item.sparePartRevenue ?? 0;
                    const vb = item.vehicleBookings ?? undefined;
                    const sb = item.sparePartBookings ?? undefined;
                    const bookingsNote =
                      vb !== undefined && sb !== undefined
                        ? `${vb} vehicle · ${sb} spare`
                        : `${item.bookings ?? 0} paid`;
                    return (
                      <div
                        key={`${item.month}-summary`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2"
                      >
                        <span className="text-gray-700 font-medium">
                          {item.month}
                        </span>
                        <span className="text-gray-900 text-right">
                          <span className="font-semibold">
                            {formatCurrency(item.revenue)}
                          </span>
                          <span className="text-gray-500 font-normal ml-2 text-xs block sm:inline">
                            V {formatCurrency(vRev)} · S {formatCurrency(sRev)}{" "}
                            · {bookingsNote}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No monthly revenue data available.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Booking Status Mix
              </h2>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div
                  className="w-40 h-40 rounded-full"
                  style={bookingDonutStyle}
                />
                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {totalBookingStates}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {bookingStatusItems.map((item) => {
                const pct = totalBookingStates
                  ? ((item.value / totalBookingStates) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${item.dot}`}
                      />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock3 className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Payment Health
              </h2>
            </div>
            <div className="space-y-4">
              <HorizontalBar
                label="Paid"
                value={stats.paidBookings || 0}
                max={paymentStatusMax}
                colorClass="bg-emerald-500"
              />
              <HorizontalBar
                label="Pending"
                value={stats.pendingPayments || 0}
                max={paymentStatusMax}
                colorClass="bg-amber-500"
              />
              <HorizontalBar
                label="Refunded"
                value={stats.refundedPayments || 0}
                max={paymentStatusMax}
                colorClass="bg-red-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Top Vendors by Revenue
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Based on paid vehicle bookings only (spare parts excluded).
            </p>

            {stats.topVendors && stats.topVendors.length > 0 ? (
              <div className="space-y-4">
                {stats.topVendors.map((vendor, index) => {
                  const width = vendorMaxRevenue
                    ? ((vendor.revenue || 0) / vendorMaxRevenue) * 100
                    : 0;
                  return (
                    <div key={vendor.vendorId || index}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800">
                          {vendor.vendorName || "Unknown Vendor"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {vendor.bookings} bookings ·{" "}
                          {formatCurrency(vendor.revenue)}
                        </p>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No vendor analytics available yet.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Recent Bookings
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Latest reservation activities across the platform
            </p>
            <div className="space-y-4">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.slice(0, 5).map((booking, index) => {
                  const spare =
                    booking.bookingType === "sparePart" ||
                    (booking.sparePartId &&
                      typeof booking.sparePartId === "object");
                  const entityName = spare
                    ? booking.sparePartId?.name || "Spare part"
                    : booking.vehicleId?.name || "Vehicle";
                  return (
                    <div
                      key={booking._id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.userId?.name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span
                            className={`inline-flex mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${spare ? "bg-teal-100 text-teal-800" : "bg-indigo-100 text-indigo-800"}`}
                          >
                            {spare ? "Spare" : "Vehicle"}
                          </span>
                          {entityName} • {formatCurrency(booking.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.bookingStatus === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.bookingStatus === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : booking.bookingStatus === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.bookingStatus || "unknown"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No recent bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return <Dashboard />;
};

export default AdminDashboard;
