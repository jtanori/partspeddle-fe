'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface ContactFormProps {
  className?: string;
}

/**
 * Standard contact form used on the contact page.
 */
export function ContactForm({ className }: ContactFormProps) {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className={className}>
        <div className="p-8 text-center">
          <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
            Message sent
          </h3>
          <p className="mt-2 font-sans text-body leading-relaxed text-foreground-secondary">
            Thanks for reaching out. Our support team will get back to you within one business day.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input id="contact-subject" name="subject" required placeholder="How can we help?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-order">Order number</Label>
            <Input id="contact-order" name="order" placeholder="Optional" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            placeholder="Tell us what you need..."
          />
        </div>

        <Button type="submit" variant="default" className="w-full sm:w-auto">
          Send message
        </Button>
      </form>
    </Card>
  );
}
