import { jsPDF } from "jspdf";

const APP_NAME = "AURA Rentals";
const BRAND_TAGLINE = "Trusted Vehicle & Spare Part Booking Platform";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) => `NPR ${Number(amount || 0).toLocaleString("en-NP")}`;

const buildVoucherData = (booking) => {
  const bookingType =
    booking?.bookingType || (booking?.vehicle || booking?.vehicleId ? "vehicle" : "sparePart");
  const item = bookingType === "vehicle" ? booking?.vehicle || booking?.vehicleId : booking?.sparePart || booking?.sparePartId;
  const customer = booking?.customer || booking?.userId || {};
  const totalAmount = booking?.totalAmount ?? booking?.amount ?? 0;
  const insuranceAmount = booking?.insuranceAmount ?? 0;
  const transactionCode =
    booking?.esewaTransactionCode ||
    booking?.esewaRefId ||
    booking?.esewaTransactionUuid ||
    "Pending Assignment";

  return {
    bookingId: booking?._id || booking?.bookingId || booking?.id || "N/A",
    bookingType: bookingType === "vehicle" ? "Vehicle" : "Spare Part",
    itemName: item?.name || "N/A",
    itemCategory: item?.category || "N/A",
    customerName: customer?.name || "N/A",
    customerEmail: customer?.email || "N/A",
    customerContact: customer?.contact || "N/A",
    startDate: formatDate(booking?.startDate),
    endDate: formatDate(booking?.endDate),
    totalDays: booking?.totalDays ?? "N/A",
    rentPerDay: booking?.rentPerDay ?? item?.rentPrice ?? "N/A",
    totalAmount: formatCurrency(totalAmount),
    insuranceSelected: booking?.insuranceSelected ? "Yes" : "No",
    insuranceAmount: formatCurrency(insuranceAmount),
    paymentMethod: booking?.paymentMethod ? String(booking.paymentMethod).toUpperCase() : "N/A",
    paymentStatus: booking?.paymentStatus || "N/A",
    bookingStatus: booking?.bookingStatus || "N/A",
    transactionCode,
    generatedAt: new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export const generateBookingVoucher = (booking) => {
  const data = buildVoucherData(booking);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 95, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(APP_NAME, 40, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(BRAND_TAGLINE, 40, 66);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("BOOKING VOUCHER", pageWidth - 190, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${data.generatedAt}`, pageWidth - 190, 66);

  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Transaction Code", 40, 130);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(40, 140, pageWidth - 80, 34, 6, 6, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text(data.transactionCode, 52, 162);

  const rows = [
    ["Booking ID", data.bookingId],
    ["Booking Type", data.bookingType],
    ["Item", `${data.itemName} (${data.itemCategory})`],
    ["Customer", data.customerName],
    ["Customer Email", data.customerEmail],
    ["Customer Contact", data.customerContact],
    ["Start Date", data.startDate],
    ["End Date", data.endDate],
    ["Total Days", String(data.totalDays)],
    ["Rate / Day", typeof data.rentPerDay === "number" ? formatCurrency(data.rentPerDay) : data.rentPerDay],
    ["Insurance Selected", data.insuranceSelected],
    ["Insurance Amount", data.insuranceAmount],
    ["Total Amount", data.totalAmount],
    ["Payment Method", data.paymentMethod],
    ["Payment Status", data.paymentStatus],
    ["Booking Status", data.bookingStatus],
  ];

  let y = 200;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${label}:`, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || "N/A"), 165, y);
    y += 22;
  });

  doc.setDrawColor(229, 231, 235);
  doc.line(40, 725, pageWidth - 40, 725);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("This voucher is system-generated and valid without signature.", 40, 742);
  doc.text(`For support contact ${APP_NAME}.`, 40, 756);

  const safeBookingId = String(data.bookingId).replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`AURA-Voucher-${safeBookingId || "booking"}.pdf`);
};
