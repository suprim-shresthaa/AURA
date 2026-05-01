import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

const ContactUs = () => {
  const contacts = [
    {
      title: "Email support",
      description: "Best for account issues, bookings, and policy questions.",
      value: "aura.official@gmail.com",
      href: "mailto:aura.official@gmail.com",
    },
    {
      title: "Phone support",
      description: "Reach us during business hours for urgent help.",
      value: "+977 9769761608",
      href: "tel:+9779769761608",
    },
    {
      title: "Office address",
      description: "For official correspondence and documentation.",
      value: "AURA Support, Babarmahal-10, Kathmandu, Nepal",
      href: "https://maps.google.com/?q=Babarmahal-10,Kathmandu,Nepal",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-16 md:p-8">
      <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-emerald-100 p-6 shadow-sm md:p-8">
        <Badge className="mb-4 bg-emerald-600 text-white hover:bg-emerald-700">
          Support
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We usually respond during business hours.
        </p>
        <p className="mt-4 max-w-3xl text-slate-700">
          If you have questions about AURA, your account, bookings, or legal pages,
          our support team is ready to help through the channels below.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {contacts.map((item) => (
          <Card key={item.title} className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">{item.title}</CardTitle>
              <CardDescription className="text-slate-600">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                {item.value}
              </a>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">What to include in your message</CardTitle>
          <CardDescription className="text-slate-600">
            Sharing these details helps us assist you faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Your full name and registered email address.</li>
            <li>A short summary of the issue and expected outcome.</li>
            <li>Any booking ID, transaction ID, or relevant date.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactUs;