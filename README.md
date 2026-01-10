## Overview
This backend handles order booking, courier assignment, and order lifecycle for a hyperlocal delivery system.

## Base URL
http://localhost:3000/api

## Endpoints
### 1. Create Order
*POST /orders*
•⁠  ⁠*Request Body:*
⁠ json
{
  "pickup": "Location A",
  "drop": "Location B",
  "deliveryType": "Express",
  "packageDetails": {
    "weight": 2,
    "dimensions": "10x10x10"
  }
}
Response:
{
  "orderId": "123",
  "status": "CREATED",
  "assignedCourier": "Courier ID or null"
}

###2. Update Order Status
PATCH /orders/:id/status

Request Body:
{
  "status": "PICKED_UP"
}

Response:

{
  "orderId": "123",
  "status": "PICKED_UP"
}



