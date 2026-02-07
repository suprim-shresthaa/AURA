import React from "react";

const InsuranceTerms = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold">
        Insurance Terms & Conditions
      </h1>
      <p className="text-gray-600">
        (Accidental Damage Coverage During Rental)
      </p>

      {/* General Conditions */}
      <ul className="list-disc pl-6 space-y-2">
        <li>This insurance covers <strong>accidental damage</strong> to the rented vehicle during the rental period only.</li>
        <li>The renter must have a <strong>valid driving license</strong> at the time of the accident.</li>
        <li>Insurance is valid only for the <strong>registered driver(s)</strong> mentioned in the booking.</li>
        <li>Coverage starts from the rental pickup time and ends at the return time.</li>
      </ul>

      {/* What Is Covered */}
      <div>
        <h2 className="text-xl font-semibold mt-6">What Is Covered</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Damage caused by road accidents.</li>
          <li>Minor collision damage (body scratches, dents).</li>
          <li>Damage caused by natural events (rain, minor flooding, falling objects).</li>
          <li>Third-party property damage (as per policy limit).</li>
        </ul>
      </div>

      {/* What Is NOT Covered */}
      <div>
        <h2 className="text-xl font-semibold mt-6">What Is NOT Covered</h2>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Damage caused due to reckless or negligent driving.</li>
          <li>Driving under the influence of alcohol or drugs.</li>
          <li>Driving without a valid license.</li>
          <li>Intentional damage to the vehicle.</li>
          <li>Damage caused outside the agreed rental period.</li>
          <li>Interior damage (unless specified).</li>
          <li>Loss of personal belongings inside the vehicle.</li>
          <li>Tire punctures due to improper usage.</li>
        </ul>
      </div>
    </div>
  );
};

export default InsuranceTerms;
