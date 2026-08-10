# ADR-004: Use Razorpay for Indian payment checkout

**Status:** Accepted

## Context

The application needs an INR payment-provider checkout flow without exposing secret credentials to the client.

## Decision

Create provider orders and verify payment signatures in Express; launch Razorpay Standard Checkout in React.

## Consequences

The API owns the key secret and order verification. Webhook/reconciliation handling remains future work.
