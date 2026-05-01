import React from "react";

const BookingTerms = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold">
        Booking Terms & Conditions
      </h1>


  

      {/* Vehicle Criteria */}
      <div>
        <h2 className="text-xl font-semibold">Vehicle & spare parts Criteria</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>The renter must present a <strong>valid original driving license</strong> at the time of vehicle pickup.</li>
          <li>The renter must carry a valid government-issued ID proof (citizenship), which is kept by the vendor at the time of renting.</li>
          <li>The vehicle will only be handed over to the person whose name is mentioned in the booking.</li>
          <li>Once a booking is confirmed, it <strong>cannot be canceled.</strong></li>
          <li>Once payment is made, it is <strong>non-refundable</strong>.</li>
          <li>Booking dates and times must be strictly followed.</li>
          <li>Any damage, accident, or loss caused due to the renter’s negligence must be paid by the renter.</li>
          <li>Traffic fines, penalties, or legal violations during the rental period are the renter’s responsibility.</li>
          <li>The renter must not allow unauthorized persons to drive the vehicle.</li>
          <li>Driving under the influence of alcohol or drugs is strictly prohibited.</li>
          <li>The company reserves the right to cancel the booking if required documents are not provided.</li>
          <li>The company reserves the right to refuse service in case of policy violations.</li>
          <li>In case of accident, the renter must inform the company immediately.</li>
          <li>Failure to report damage may result in full liability for repair cost.</li>
        </ul>
      </div>
        {/* Spare Parts Criteria */}
      <div>
        <h2 className="text-xl font-semibold">Spare Parts Criteria</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>All spare parts provided with the vehicle (tools, spare tire, accessories) must be returned in the same condition.</li>
          <li>Missing or damaged spare parts will be charged to the renter at full replacement cost.</li>
       
        </ul>
      </div>

      {/* Late Return Policy */}
      <div>
        <h2 className="text-xl font-semibold">Late Return Policy</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>The vehicle must be returned on time as per the agreed schedule.</li>
          <li>If the vehicle is returned late, the renter will be charged <strong>double the daily rental rate</strong> for each extra day.</li>
          <li>Repeated delays in return may result in additional penalties or restrictions on future bookings.</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingTerms;
