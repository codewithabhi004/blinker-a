# Blinker-a

Blinker-a is a React/Vite messaging MVP with an Express/Socket.IO API, PostgreSQL/Prisma data model, and a Capacitor path to Android. The browser opens in a local demo mode so the chat UI is usable before configuring the API.

## Project layout

```text
.
├── index.html
├── src/
│   ├── App.jsx
│   ├── data.js
│   ├── main.jsx
│   ├── styles.css
│   └── components/
│       ├── Avatar.jsx
│       ├── ChatSidebar.jsx
│       ├── ChatWindow.jsx
│       └── MessageInput.jsx
├── server/
│   ├── prisma/schema.prisma
│   ├── prisma.config.ts
│   └── src/
│       ├── auth.js
│       ├── db.js
│       ├── index.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── chats.js
│       │   └── contacts.js
│       └── sockets.js
├── android/ (Capacitor Android project)
├── capacitor.config.json
├── vite.config.js
├── package-lock.json
└── package.json
```

Prisma Client is generated into `server/src/generated/client/` (gitignored) by `npm run db:generate`.

## Run the web app and API

Requirements: Node.js 20.19+ and PostgreSQL 14+.

1. Install packages: `npm install`
2. Create a PostgreSQL database named `blinkera`.
3. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN`. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Generate Prisma Client and create the development schema:

   ```powershell
   npm run db:generate
   npm run db:push
   ```

5. Start the API in one terminal: `npm run server`
6. Start Vite in another terminal: `npm run dev`
7. Open the Vite URL printed in the terminal. In development, requested OTP values are printed in the API terminal.

The OTP route intentionally refuses to operate in production until a real SMS/email delivery provider is integrated. Never deploy with the development OTP behavior or a sample JWT secret.

## Android build

Set `VITE_API_URL` in the root `.env` to the HTTPS URL of your deployed API before building the web assets. The native Android contacts plugin only runs in the installed native app; browser preview mode explains this when contact discovery is selected.

```powershell
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio, run the app on a device/emulator. Contact discovery asks for Android contacts permission only after the user chooses **Find people** and confirms an in-app disclosure. It submits phone numbers for matching; it does not upload contact names or save the address book. Matching only returns a profile when that account has explicitly enabled **Let people find me by phone**. A production release should use TLS, add platform permission rationale/Play Data Safety disclosures, and obtain privacy/legal review.

### Download a debug APK from GitHub

After pushing the repository to GitHub, the **Build Android APK** workflow runs on pushes to `main` or can be started from the Actions tab. Download `blinker-a-android-debug` from the completed workflow run's **Artifacts** section. The APK is a debug build for testing/sideloading, not a Play Store signed release.

## API and realtime events

REST endpoints include:

- `POST /api/auth/request-otp` and `POST /api/auth/verify-otp`
- `GET /api/auth/me` and `PATCH /api/auth/me` for profile/discovery preferences
- `GET /api/chats`, `GET /api/chats/public`, `POST /api/chats`, public group/channel join, and chat member-management endpoints
- `PATCH /api/chats/:chatId/settings` to manage group invite/pin permissions
- `POST /api/contacts/match`

Socket.IO authenticates with `{ auth: { token } }` and supports `chat:join`, `message:send`, `message:edit`, `message:delete`, `message:forward`, `message:read`, and `typing:start` / `typing:stop`. Membership is checked before chat operations.

## MVP boundary

The demo stores sample conversations locally in the current browser. The backend provides persistence for accounts, chats, messages, group roles, replies, pinned-message references, deletion, and read receipts. Real OTP delivery, production media object storage, end-to-end encryption, push notifications, and production-grade abuse/moderation controls still need provider/infrastructure integration before a public launch. The web demo previews selected media locally; binary files are not uploaded by the API yet.
