import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

const TermsOfService = () => {
  const terms = [
    {
      title: "Eligibility and accounts",
      details: [
        "You must provide accurate registration details and keep account credentials secure.",
        "You are responsible for activity carried out through your account.",
      ],
    },
    {
      title: "Use of the service",
      details: [
        "Use AURA only for lawful purposes and in line with all platform policies.",
        "Do not attempt unauthorized access or actions that disrupt the system or other users.",
      ],
    },
    {
      title: "Bookings and payments",
      details: [
        "Pricing, availability, fees, and cancellation terms are confirmed during checkout.",
        "Additional insurance and booking terms may apply based on selected services.",
      ],
    },
    {
      title: "Third-party services",
      details: [
        "Some services are provided by independent vendors with their own terms and policies.",
        "Where third parties are involved, obligations between you and that provider may apply.",
      ],
    },
    {
      title: "Disclaimer and limitation",
      details: [
        'Services are provided on an "as is" and "as available" basis where legally allowed.',
        "AURA is not liable for indirect or consequential damages except as required by law.",
      ],
    },
    {
      title: "Changes and termination",
      details: [
        "We may update these terms and communicate major changes when appropriate.",
        "Continued use after updates may constitute acceptance of the revised terms.",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-16 md:p-8">
      <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-violet-100 p-6 shadow-sm md:p-8">
        <Badge className="mb-4 bg-violet-600 text-white hover:bg-violet-700">Legal</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: March 28, 2026</p>
        <p className="mt-4 max-w-3xl text-slate-700">
          These Terms govern your access to and use of AURA services. By continuing
          to use AURA, you agree to follow the terms outlined below.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {terms.map((item) => (
          <Card key={item.title} className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">{item.title}</CardTitle>
              <CardDescription className="text-slate-600">
                Key terms to ensure safe and fair platform use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Need clarification?</CardTitle>
          <CardDescription className="text-slate-600">
            We are available to explain any part of these terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Questions about these Terms can be sent through our
          <a className="ml-1 font-medium text-violet-700 hover:underline" href="/contact">
            Contact Us
          </a>
          page.
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
