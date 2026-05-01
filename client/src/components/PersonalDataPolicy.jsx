import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

const PersonalDataPolicy = () => {
  const sections = [
    {
      title: "Information we collect",
      description:
        "We collect data you share with us directly as well as usage data needed to run and improve AURA.",
      points: [
        "Account details such as your name, email, phone number, and profile information.",
        "Booking and transaction details for vehicle rentals, spare parts, and payments.",
        "Technical data like device type, browser, log events, and interaction patterns.",
      ],
    },
    {
      title: "How we use your information",
      description:
        "Your data is used only to deliver reliable service, improve product quality, and keep users safe.",
      points: [
        "Create and manage your account and personalize your experience.",
        "Process bookings, payments, cancellations, and refunds.",
        "Send important updates such as booking status, security alerts, and support responses.",
      ],
    },
    {
      title: "Sharing of information",
      description:
        "We only share information when it is necessary to operate the platform or comply with legal duties.",
      points: [
        "With trusted service providers such as payment processors and hosting partners.",
        "When required by law, legal process, or legitimate safety and fraud prevention needs.",
        "With your consent or when you explicitly request integrations with third-party services.",
      ],
    },
    {
      title: "Data retention and security",
      description:
        "We retain information only as long as needed for business and legal purposes and use safeguards to protect it.",
      points: [
        "Data is stored for limited periods based on service needs and regulatory obligations.",
        "Security controls are in place to reduce unauthorized access and data misuse risks.",
        "No internet-based system is 100% secure, so we continuously improve protection measures.",
      ],
    },
    {
      title: "Your choices",
      description:
        "You can request updates to personal data and manage many settings from your account.",
      points: [
        "Update profile information from your account settings whenever available.",
        "Contact us to request access, correction, or clarification of your personal data.",
        "Opt out of non-essential communication where those controls are provided.",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-16 md:p-8">
      <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-sky-100 p-6 shadow-sm md:p-8">
        <Badge className="mb-4 bg-sky-600 text-white hover:bg-sky-700">Legal</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: March 28, 2026</p>
        <p className="mt-4 max-w-3xl text-slate-700">
          AURA ("we", "us", or "our") is committed to protecting your personal data.
          This policy explains what information we collect, why we collect it, and
          how we keep it secure.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">{section.title}</CardTitle>
              <CardDescription className="text-slate-600">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Changes and contact</CardTitle>
          <CardDescription className="text-slate-600">
            We may revise this policy from time to time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            Updated policies are published on this page with a new effective date.
          </p>
          <p>
            Questions about this Privacy Policy can be sent through our
            <a className="ml-1 font-medium text-sky-700 hover:underline" href="/contact">
              Contact Us
            </a>
            page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDataPolicy;
