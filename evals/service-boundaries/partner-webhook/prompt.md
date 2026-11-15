---
description: A partner webhook handler maps the payload once at the edge, keeps the raw body for replay with a retention period, and is tested with captured payloads.
tags: [service-boundaries, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We're integrating a shipping partner. Their webhook posts JSON like `{ "evt": "SHIP_UPD", "shp": { "trk_no": "...", "st_cd": "DLV", "ts": 1767139200 } }`. My plan:

- The handler verifies the signature, then calls `shipments.applyUpdate(body.shp)` and `notifications.onShipment(body.shp)`; those services read `st_cd` and `trk_no` as needed.
- Tests: I'll write a few JSON payloads by hand from their docs.
- Nothing stored except the resulting shipment row.

Write the handler and say what you'd change. Reply in your message; you don't need to create files.
