# Implement Bonus Request Workflow and Notifications

This plan addresses the user's request to require users to explicitly "Accept" or "Reject" bonuses sent by the admin, track these in their history, ensure the admin panel remains fully responsive, and integrate engaging pop-up notifications for key actions (buying plans, withdrawing, receiving bonuses).

## User Review Required
> [!WARNING]
> We will be adding a new database model `BonusRequest` and running a database migration. This will slightly alter the way the Admin issues bonuses: instead of instantly adding funds, the admin will "Send a Bonus Request" that the user must approve.

## Open Questions
1. Do you want pending bonuses to expire after a certain number of days if the user doesn't accept or reject them, or should they stay pending indefinitely?
2. Are you okay with using `react-hot-toast` as the notification library for the popups? It provides very clean, modern, and engaging toast notifications.

## Proposed Changes

### Database Schema
We will update the Prisma schema to introduce a new request type.

#### [MODIFY] prisma/schema.prisma
- Add a new `BonusRequest` model:
  ```prisma
  model BonusRequest {
    id          String        @id @default(cuid())
    userId      String
    amount      Float
    description String
    status      RequestStatus @default(PENDING)
    createdAt   DateTime      @default(now())
    updatedAt   DateTime      @updatedAt

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```
- Add the `bonusRequests BonusRequest[]` relation to the `User` model.

---

### Backend API Routes
Updates to handle the new `BonusRequest` lifecycle.

#### [MODIFY] src/app/api/users/[id]/route.ts
- Instead of instantly updating the `User` balance and creating a `Transaction`, the Admin's `PUT` request will create a new `BonusRequest` with `status: PENDING`.

#### [NEW] src/app/api/bonus/route.ts
- Create a `GET` endpoint to fetch the logged-in user's `BonusRequest` history (pending, accepted, rejected).

#### [NEW] src/app/api/bonus/[id]/route.ts
- Create a `PUT` endpoint for the user to update a `BonusRequest` status to `APPROVED` or `REJECTED`. 
- If `APPROVED`, it will add the `amount` to the user's `balance` and log a `BONUS` type `Transaction`.

---

### User Interface (Dashboard & History)
Integration of the new user-facing bonus features.

#### [MODIFY] src/app/(app)/dashboard/page.tsx
- Add an API call to check for `PENDING` bonus requests.
- If pending requests exist, render a highly engaging "Bonus Available!" banner at the top of the dashboard with "Accept" and "Reject" buttons.

#### [MODIFY] src/app/(app)/history/page.tsx
- Add a new "Bonuses" tab to the History UI.
- Fetch and display the status of all past bonus requests (`PENDING`, `APPROVED`, `REJECTED`).

---

### Admin Interface
Tweaking the terminology and verifying mobile responsiveness.

#### [MODIFY] src/app/(admin)/admin/bonus/page.tsx
- Change the submit button text from "Add Bonus" to "Send Bonus Request".
- Change the success message to indicate the request was sent successfully.
- Verify all responsive tailwind classes are fully operational on mobile viewports.

---

### Notifications System (Popups)
Installing and integrating toast notifications for engaging user feedback.

#### [NEW] Global Toaster
- Run `npm install react-hot-toast` to add the toast library.
- Add `<Toaster />` to `src/app/(app)/layout.tsx` so toasts can be triggered anywhere in the user panel.

#### [MODIFY] Action Handlers
- Update `Withdraw` submit logic to show a success toast ("Withdrawal requested successfully!").
- Update `Active Plans` / `Plan Details` purchase logic to show a success toast ("Plan purchased successfully!").
- Update Bonus accept logic to show a success toast ("Bonus accepted! Balance updated.").

## Verification Plan

### Automated Tests
1. Run `npx prisma db push` to synchronize the new schema.
2. Run `npm run build` to ensure type safety is maintained across the new APIs.

### Manual Verification
1. Login as **Admin**, navigate to the Bonus page, and send a bonus to a test user.
2. Login as the **Test User**, observe the new popup notification and the banner in the Dashboard.
3. Accept the bonus, verify the balance increases and a success toast appears.
4. Verify the Bonus appears as "APPROVED" in the new History tab.
5. Purchase a plan and request a withdrawal to verify the new toast notifications fire correctly.
6. Shrink the browser window on the Admin Bonus page to guarantee mobile responsiveness.
