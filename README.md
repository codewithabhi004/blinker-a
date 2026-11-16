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

Requirements: Node.js 22 and a PostgreSQL database (local PostgreSQL or a hosted provider such as Neon).

1. Install packages: `npm ci`
2. Copy `.env.example` to `.env`. Set `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN=http://localhost:3000`. Generate a secret locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit `.env`.
3. Generate Prisma Client and create the database schema:

   ```powershell
   npm run db:generate
   npm run db:push
   ```

4. Start the API in one terminal: `npm run server`
5. Start Vite in another terminal: `npm run dev`
6. Open `http://localhost:3000`. Vite proxies `/api` and Socket.IO to the local API.

Sign-up and sign-in use a unique username and a password of at least 12 characters. Phone numbers are not required. There is no password-recovery flow yet, so users must keep their password safe. Users can find one another by exact username; phone-contact matching remains unavailable until a phone number has been verified and the user opts in. SMS verification endpoints remain available for a future verified-phone flow, but require a configured SMS provider and may incur charges.

## Android build

Set `VITE_API_URL` in the root `.env` to the HTTPS URL of your deployed API before building Android assets. The native Android contacts plugin asks for permission only after a user taps **Sync contacts**. The app sends phone numbers for matching; names and the address book remain on the device. Phone matching only returns verified profiles that opted in; users without a verified phone can be found by exact username instead.

```powershell
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, run the app on a device/emulator. Contact discovery asks for Android contacts permission only after the user taps **Sync contacts** and confirms the in-app disclosure. It submits phone numbers for matching; it does not upload contact names or save the address book. Matching only returns a verified profile when that account has explicitly enabled **Let people find me by phone**. A production release should add platform permission rationale/Play Data Safety disclosures and obtain privacy/legal review.

### Download and install the Android APK

Set the GitHub Actions repository variable `VITE_API_URL` to the deployed API URL. This same variable is used by GitHub Pages and Android builds. Push a version tag such as `v1.0.0` to build the APK and publish it as a public GitHub Release. Android users can download the APK from **Releases → latest → `blinker-a.apk`** and install the downloaded package; this is a real Android app, not an **Add to Home Screen** shortcut. You can also run **Build Android APK** manually from the Actions tab to produce a temporary test artifact.

The workflow currently creates a debug-signed APK for sideload testing, not a Google Play release. Android may require enabling installation from the browser. Debug builds from separate workflow runs may not share the same signing key, so installing an update can require uninstalling the previous build. A persistent private release key and Google Play signing setup are separate requirements; never commit signing keys or passwords.

## Free-tier deployment setup

The deployment uses Vercel for the static web app, Render for the persistent Express/Socket.IO API, and a PostgreSQL provider such as Neon. Vercel's serverless functions are not used for the persistent Socket.IO server. Free plans have usage limits and may sleep or change; SMS delivery may incur a separate charge.

1. Push the repository to GitHub and import it into Vercel. The included `vercel.json` builds and serves the Vite app.
2. Create a PostgreSQL database on Neon (or another PostgreSQL host). In the Vercel project settings, add `VITE_API_URL` with the HTTPS URL of the Render API. Add the same URL as a GitHub Actions repository variable named `VITE_API_URL`; the Pages and Android workflows use it when building.
3. In Render, create a Blueprint from this repository using `render.yaml`. Set `DATABASE_URL` to the PostgreSQL connection string and `CLIENT_ORIGIN` to the exact website frontend origin(s), comma-separated (for example `https://blinker-a.vercel.app,https://codewithabhi004.github.io`). The API automatically allows Capacitor's Android origin (`https://localhost`). Render generates `JWT_SECRET`. Twilio credentials are only needed if phone verification is enabled.
4. With `DATABASE_URL` set in the local `.env`, run `npm run db:push` once to create/update the database schema. Never publish database or Twilio credentials in the repository.
5. Redeploy the Vercel frontend after setting `VITE_API_URL`, then build/sync Android with that same API URL.

GitHub Pages remains supported for the static frontend through **Settings → Pages → GitHub Actions**. Its Vite base path and API URL are selected automatically in the Pages workflow; set the repository variable before deploying so login and signup can reach the API.

## API and realtime events

REST endpoints include:

- `POST /api/auth/request-otp` and `POST /api/auth/verify-otp`
- `GET /api/auth/me` and `PATCH /api/auth/me` for profile/discovery preferences
- `GET /api/chats`, `GET /api/chats/public`, `POST /api/chats`, public group/channel join, and chat member-management endpoints
- `PATCH /api/chats/:chatId/settings` to manage group invite/pin permissions
- `POST /api/contacts/match`

Socket.IO authenticates with `{ auth: { token } }` and supports `chat:join`, `message:send`, `message:edit`, `message:delete`, `message:forward`, `message:read`, and `typing:start` / `typing:stop`. Membership is checked before chat operations.

## MVP boundary

Username/password accounts, optional verified-phone contact matching, PostgreSQL-backed chats, realtime text messages, presence, and basic message operations are provided by the API. Username search is exact-match; phone contact matching is limited to verified accounts that opt in. Media uploads, end-to-end encryption, push notifications, and actual voice/video calling still need additional providers and implementation before a public launch. The current free-tier deployment is suitable for testing, not a reliability guarantee for production.
