# LICENSING ARCHITECTURE — DocuVerse Studio

## 1. Plan Model
Exactly one Premium Plan. All plans unlock the same included features.
Durations: Monthly, Yearly, Lifetime. Trial: 7 days full access.

Prices (configurable by owner):
- Monthly: Rs. 999
- Yearly: Rs. 7,999
- Lifetime: Rs. 19,999

## 2. Components
- Client (desktop app) — verifies signed licenses offline.
- Activation service (server) — issues signed licenses, binds devices.
- Update feed — separate from activation; optional.
- Public verification key bundled in client.
- Private signing key only on server.

## 3. Trial
- On first run, client creates a signed trial record bound to device.
- Trial record stores start time, duration (7 days), device id, signature.
- Tamper resistance is best-effort locally; server validation on activation.
- Trial status always visible in UI.

## 4. Purchase & Activation
1. User purchases via web/portal (outside desktop app).
2. Activation service generates signed license:
   - fields: license_id, plan, duration, issued_at, expires_at (null for
     lifetime), device_id, features: ["premium"], signature.
3. User pastes/enters activation code in app.
4. App verifies signature with public key, binds device, stores in secure store.
5. Optional sync to refresh status.

## 5. Offline Grace
- After successful activation, client operates fully offline.
- Configurable grace window (e.g., 30 days) for periodic validation.
- Beyond grace, app remains functional for local document access; new
  license-required operations may be gated with clear UI messaging.
- Expired licenses never delete or corrupt user documents.

## 6. Device Management
- Device bound via hashed device fingerprint.
- Deactivation frees a slot (server authoritative).
- Transfer requires explicit server-side action.
- Lifetime license recognition via signed credential.

## 7. Renewal
- Monthly/Yearly: renewal extends expires_at via new signed license.
- Lifetime: no expiry; update policy published clearly.

## 8. Security
- No private keys or payment secrets in client.
- Signed license blob verified with bundled public key.
- Secure storage of license blob and device id.
- Recovery flow: re-issue license to same device via server.

## 9. Update Eligibility (documented for customer)
- Monthly/Yearly: updates during active subscription.
- Lifetime: updates per published lifetime policy (must be explicit).
- The UI must display exactly what the customer's license includes.

## 10. Invariants
- All Premium plans unlock identical included features.
- No separate editions.
- No hidden paid modules; optional modules are all covered by Premium.
- Files remain accessible after expiry; only license-gated *new operations*
  may be restricted, with honest messaging.