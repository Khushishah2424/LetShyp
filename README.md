## Overview
This backend handles order booking, automatic courier assignment, and strict order lifecycle management for a hyperlocal delivery system.

---

## Base URL
http://localhost:3000/api

---

## Order Lifecycle
CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED  
CREATED / ASSIGNED → CANCELLED  

Invalid or out-of-order state transitions are rejected.

---

## 1) Create Order
POST /orders

### Request Body
{
  "pickup": { "x": 2, "y": 3 },
  "drop": { "x": 10, "y": 6 },
  "deliveryType": "EXPRESS"
}

### Rules
- Nearest available courier is assigned automatically
- Distance is calculated deterministically
- Express orders are restricted by distance
- If no courier is eligible, order remains CREATED

---

## 2) Update Order Status
PATCH /orders/:id/status

### Request Body
{
  "status": "PICKED_UP"
}

Rules:
- Status must follow lifecycle order
- Delivered or cancelled orders cannot be updated

---

## 3) Cancel Order
PATCH /orders/:id/cancel

### Rules
- Allowed only when status is CREATED or ASSIGNED
- Assigned courier is released immediately

### Response
{
  "message": "Order cancelled successfully",
  "order": {
    "status": "CANCELLED"
  }
}

---

## Concurrency Handling

Courier assignment is handled atomically using:

findOneAndUpdate(
  { _id, available: true },
  { $set: { available: false } }
)

This guarantees:
- A courier can handle only one active order
- Race conditions are prevented during concurrent requests


