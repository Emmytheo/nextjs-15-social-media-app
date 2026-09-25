# 🚀 ECOSYSTEM PLATFORM HANDOFF & MASTER BLUEPRINT
**Project:** All-in-One Community, Social, Event, Financial & Organization OS  
**Target Architecture:** Next.js 15 (App Router) + React 19 + Prisma ORM ➔ Eventual Supabase Migration

---

## 1. Executive Vision & Core Philosophy

This platform is **not merely a social network**; it is a **Holistic Community & Organization Operating System (OS)** designed to serve diverse groups (churches, musical guilds, startups, universities, NGOs, developer collectives, creator communities).

It integrates the best capabilities of:
- **LinkedIn & Facebook**: Multi-tenant organizations, communities, professional profiles, discussion feeds.
- **Luma & Eventbrite**: End-to-end event management, hybrid/virtual/physical ticketing, RSVPs, calendars.
- **GoFundMe & Digital Wallets**: Built-in multi-currency wallets, crowdfunding campaigns with progress meters, donor walls, Paystack & Crypto settlement.
- **Coursera & Teachable**: Structured LMS courses, video lessons, progress tracking, and certificates.
- **Amazon & Shopify**: Community storefronts for physical merchandise, digital downloads, and booked services.
- **Custom Modular Tools**: Specialized community plugins (such as the existing `sol2snd` music/hymn sol-fa tool, music streaming library, and admin analytics dashboard).

---

## 2. Engineering Strategy: DB-Agnostic First ➔ Supabase Second

### Why We Build DB-Agnostic with Prisma First:
1. **Unmatched Velocity**: You develop and test all domain models, UI workflows, server actions, and business logic locally without being blocked by cloud CORS, Supabase RLS debug cycles, or remote provisioning.
2. **Prisma is the Natural Abstraction Layer**: Prisma code (`prisma.organization.create`, `prisma.event.findMany`, etc.) is vendor-neutral. Switching from Neon PostgreSQL to Supabase PostgreSQL requires **literally 1 line in `.env`** (`DATABASE_URL=postgres://...supabase...`) followed by `npx prisma db push`.
3. **Smooth, Staged Migration**: Once the ecosystem is fully built and tested:
   - **Step A (Database)**: Update connection string to Supabase Postgres pooler.
   - **Step B (Auth)**: Swap deprecated Lucia Auth (`lucia` + `arctic`) for `@supabase/ssr` (syncing `auth.users` to `public.users`).
   - **Step C (Storage)**: Route upload hooks from UploadThing to Supabase Storage buckets.
   - **Step D (Realtime)**: Layer `supabase.channel()` on top of React Query caches for instant live updates.

---

## 3. Critical Fixes & Improvements Verified (Carry Over to New Copy)

Before building new modules, ensure the following stability fixes are present in the target codebase:

### A. TypeScript & Dependency Fixes
1. **`src/components/ui/input.tsx`**: Must re-export `InputProps`:
   ```tsx
   export interface InputProps extends React.ComponentProps<"input"> {}
   ```
   *(Without this, `PasswordInput.tsx` throws `error TS2305: Module '"./ui/input"' has no exported member 'InputProps'`)*.
2. **`src/components/ui/progress.tsx`**: Replaced external `@radix-ui/react-progress` with a self-contained accessible WAI-ARIA progress bar to eliminate React 19 RC peer-dependency conflicts:
   ```tsx
   export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
     value?: number | null;
     max?: number;
   }
   ```
3. **`src/auth.ts`**: Wrapped `validateRequest` in try-catch with dynamic server usage re-throw to allow Next.js 15 App Router static analysis to build cleanly.

### B. Navigation & Asset Path Fixes
1. **`src/app/(main)/Navbar.tsx`**: Changed relative logo paths (`img/icon.png`) to absolute paths (`/img/icon.png` and `/img/logo.png`) so nested routes (e.g. `/posts/[id]`, `/users/[username]`) do not fail with 404 images. Replaced dynamic state with CSS classes (`h-8 md:hidden` / `hidden md:block`) to prevent layout shift.
2. **Active Navigation Highlighting**:
   - `HomeButton.tsx`: Highlights when `pathname === "/"`.
   - `BookmarksButton.tsx`: Highlights when `pathname === "/bookmarks"`.
   - `NotificationsButton.tsx`: Highlights when `pathname === "/notifications"`.
   - `MessagesButton.tsx`: Highlights when `pathname === "/messages"`.
   - `MenuBar.tsx`: Wrapped unread counters in `Promise.allSettled` to prevent network drops from breaking navigation.

### C. Missing Hashtag Route (`/hashtag/[tag]`)
Clicking any hashtag in post content or the Trending Topics sidebar previously threw a 404:
- **`src/app/api/posts/hashtag/[tag]/route.ts`**: Cursor-paginated API fetching posts with `contains: #${tag}` (case-insensitive).
- **`src/app/(main)/hashtag/[tag]/HashtagFeed.tsx`**: Infinite-scroll container with loading skeletons.
- **`src/app/(main)/hashtag/[tag]/page.tsx`**: Hashtag discovery header and post feed.

### D. Interactive Followers & Following Lists
- **`src/lib/types.ts`**: Added `following: true` to `getUserDataSelect` `_count`.
- **`src/app/api/users/[userId]/followers/list/route.ts`** & **`following/list/route.ts`**: Endpoints returning full connection lists.
- **`src/components/UserListDialog.tsx`**: Interactive modal listing users with avatars, bios, and live Follow/Unfollow toggle.
- **`src/components/FollowerCount.tsx`** & **`FollowingCount.tsx`**: Clicking either count on user profiles or `UserTooltip.tsx` triggers the modal.

### E. Post Media Lightbox
- **`src/components/posts/MediaLightbox.tsx`**: High-resolution image viewer dialog with dark backdrop, download button, and close controls.
- **`src/components/posts/Post.tsx`**: Clicking post image attachments opens full-screen zoom preview.

---

## 4. Master Schema Blueprint for Full Ecosystem

Add the following models to `prisma/schema.prisma` to power the multi-tenant community OS:

```prisma
// ==========================================
// 1. MULTI-TENANT ORGANIZATIONS & COMMUNITIES
// ==========================================
model Organization {
  id             String        @id @default(cuid())
  name           String
  slug           String        @unique
  description    String?
  logoUrl        String?
  bannerUrl      String?
  website        String?
  isVerified     Boolean       @default(false)
  
  // Enabled feature modules (JSON: { events: true, store: true, lms: true, wallet: true, customTools: ['sol2snd'] })
  enabledModules Json          @default("{}")

  members        OrgMember[]
  posts          Post[]
  events         Event[]
  campaigns      Campaign[]
  courses        Course[]
  products       Product[]
  wallets        Wallet[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@map("organizations")
}

model OrgMember {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  role      OrgRole      @default(MEMBER)
  joinedAt  DateTime     @default(now())

  @@unique([userId, orgId])
  @@map("org_members")
}

enum OrgRole {
  OWNER
  ADMIN
  MODERATOR
  MEMBER
  CONTRIBUTOR
}

// ==========================================
// 2. EVENTS & TICKETING (Luma / Eventbrite)
// ==========================================
model Event {
  id          String        @id @default(cuid())
  orgId       String?
  org         Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  creatorId   String
  creator     User          @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  title       String
  slug        String        @unique
  description String
  coverImage  String?
  eventType   EventType     @default(PHYSICAL)
  location    String?       // Physical address or virtual link
  virtualUrl  String?
  startDate   DateTime
  endDate     DateTime
  ticketPrice Decimal       @default(0.00) // 0 for free event
  capacity    Int?

  tickets     EventTicket[]
  createdAt   DateTime      @default(now())

  @@map("events")
}

enum EventType {
  PHYSICAL
  VIRTUAL
  HYBRID
}

model EventTicket {
  id         String       @id @default(cuid())
  eventId    String
  event      Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId     String
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  status     TicketStatus @default(CONFIRMED)
  qrCode     String?
  paidAmount Decimal      @default(0.00)
  createdAt  DateTime     @default(now())

  @@map("event_tickets")
}

enum TicketStatus {
  CONFIRMED
  CHECKED_IN
  CANCELLED
}

// ==========================================
// 3. WALLETS & CROWDFUNDING (GoFundMe / Crypto)
// ==========================================
model Wallet {
  id         String        @id @default(cuid())
  userId     String?
  user       User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  orgId      String?
  org        Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  balance    Decimal       @default(0.00)
  currency   String        @default("USD") // "USD", "NGN", "USDT"
  
  transactions Transaction[]
  updatedAt    DateTime      @updatedAt

  @@map("wallets")
}

model Transaction {
  id          String            @id @default(cuid())
  walletId    String
  wallet      Wallet            @relation(fields: [walletId], references: [id], onDelete: Cascade)
  type        TransactionType
  amount      Decimal
  fee         Decimal           @default(0.00)
  status      TransactionStatus @default(PENDING)
  provider    PaymentProvider   @default(PAYSTACK)
  reference   String            @unique
  metadata    Json?
  createdAt   DateTime          @default(now())

  @@map("transactions")
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  DONATION
  TICKET_SALE
  STORE_PURCHASE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}

enum PaymentProvider {
  PAYSTACK
  CRYPTO
  STRIPE
  WALLET
}

model Campaign {
  id           String        @id @default(cuid())
  orgId        String?
  org          Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  creatorId    String
  creator      User          @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  title        String
  slug         String        @unique
  story        String
  targetAmount Decimal
  raisedAmount Decimal       @default(0.00)
  currency     String        @default("USD")
  coverImage   String?
  deadline     DateTime?
  status       CampaignStatus @default(ACTIVE)

  donations    Donation[]
  createdAt    DateTime      @default(now())

  @@map("campaigns")
}

enum CampaignStatus {
  ACTIVE
  FUNDED
  CLOSED
}

model Donation {
  id         String    @id @default(cuid())
  campaignId String
  campaign   Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  donorId    String?
  donor      User?     @relation(fields: [donorId], references: [id], onDelete: SetNull)
  donorName  String    @default("Anonymous")
  amount     Decimal
  message    String?
  createdAt  DateTime  @default(now())

  @@map("donations")
}

// ==========================================
// 4. LEARNING & COURSES (Coursera / LMS)
// ==========================================
model Course {
  id           String        @id @default(cuid())
  orgId        String?
  org          Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  instructorId String
  instructor   User          @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  
  title        String
  slug         String        @unique
  description  String
  thumbnailUrl String?
  price        Decimal       @default(0.00)
  isPublished  Boolean       @default(false)
  level        CourseLevel   @default(BEGINNER)

  modules      CourseModule[]
  enrollments  CourseEnrollment[]
  createdAt    DateTime      @default(now())

  @@map("courses")
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model CourseModule {
  id         String   @id @default(cuid())
  courseId   String
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title      String
  orderIndex Int
  lessons    Lesson[]

  @@map("course_modules")
}

model Lesson {
  id              String       @id @default(cuid())
  moduleId        String
  module          CourseModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title           String
  videoUrl        String?
  content         String?
  durationSeconds Int          @default(0)
  orderIndex      Int

  @@map("lessons")
}

model CourseEnrollment {
  id                 String    @id @default(cuid())
  courseId           String
  course             Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId             String
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  progressPercentage Int       @default(0)
  completedAt        DateTime?
  enrolledAt         DateTime  @default(now())

  @@unique([courseId, userId])
  @@map("course_enrollments")
}

// ==========================================
// 5. MARKETPLACE & STORE (Amazon / Shopify)
// ==========================================
model Product {
  id          String        @id @default(cuid())
  orgId       String?
  org         Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  title       String
  slug        String        @unique
  description String
  price       Decimal
  images      String[]
  stockCount  Int           @default(0)
  productType ProductType   @default(PHYSICAL)
  downloadUrl String?

  orderItems  OrderItem[]
  createdAt   DateTime      @default(now())

  @@map("products")
}

enum ProductType {
  PHYSICAL
  DIGITAL
  SERVICE
}

model Order {
  id          String      @id @default(cuid())
  buyerId     String
  buyer       User        @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  totalAmount Decimal
  status      OrderStatus @default(PENDING)
  items       OrderItem[]
  createdAt   DateTime    @default(now())

  @@map("orders")
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int     @default(1)
  price     Decimal

  @@map("order_items")
}
```

---

## 5. Next Steps in the Target Workspace

When switching to the new copy where parts of this have already begun:
1. **Sanity Check**: Run `cmd.exe /c npx tsc --noEmit` and check for any type mismatches.
2. **Inspect Existing Work**: Review which modules are already present in that copy (e.g. store, crypto payment simulator, Sol2Snd, admin).
3. **Merge Schema**: Ensure the `Organization` multi-tenant relation connects with whichever modules exist.
4. **Implement Missing Routes**: Apply the hashtag fix, follower modals, and lightbox viewer if missing in that copy.
5. **Verify Build**: Run `cmd.exe /c npm run build` to guarantee zero errors across all routes.
