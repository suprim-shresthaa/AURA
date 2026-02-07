// components/BookingTerms.tsx

import React from "react";

const BookingTerms = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold">
        Booking Terms & Conditions
      </h1>

      <ul className="list-disc pl-6 space-y-2">
        <li>The renter must present a <strong>valid original driving license</strong> at the time of vehicle pickup.</li>
        <li>The renter must carry a valid government-issued ID proof (citizenship), which is kept by the vendor at the time of renting.</li>
        <li>The vehicle will only be handed over to the person whose name is mentioned in the booking.</li>
        <li>Once a booking is confirmed, it <strong>cannot be canceled.</strong></li>
        <li>Once payment is made, it is <strong>non-refundable</strong>.</li>
        <li>Booking dates and times must be strictly followed.</li>
        <li>The renter is fully responsible for the vehicle during the rental period.</li>
        <li>Any damage, accident, or loss caused due to the renter’s negligence must be paid by the renter.</li>
        <li>Traffic fines, penalties, or legal violations during the rental period are the renter’s responsibility.</li>
        <li>The vehicle must be returned on time. Late return may result in additional charges.</li>
        <li>The vehicle must be returned in the same condition as provided (except normal wear and tear).</li>
        <li>The renter must not allow unauthorized persons to drive the vehicle.</li>
        <li>Driving under the influence of alcohol or drugs is strictly prohibited.</li>
        <li>The company reserves the right to cancel the booking if required documents are not provided.</li>
        <li>The company reserves the right to refuse service in case of policy violations.</li>
        <li>In case of accident, the renter must inform the company immediately.</li>
        <li>Failure to report damage may result in full liability for repair cost.</li>
      </ul>
    </div>
  );
};

export default BookingTerms;
