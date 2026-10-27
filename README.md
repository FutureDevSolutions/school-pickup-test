# School Pickup (React Native)

Mobile desk app for school staff: enter student **name** + **class**, tap **School Pickup**, and see the live board. The kiosk TV (`kisko-mobile`) gets the same updates over socket.

## Run

```bash
cd D:\FDS\school-pickup-mobile
npm start
# other terminal:
npm run android
# or
npm run ios
```

## Config

`src/config.ts` mirrors kisko-mobile:

| Mode | API (`getBaseUrl`) | Socket (`getSocketUrl`) |
|------|--------------------|-------------------------|
| Development (`IS_PRODUCTION = false`) | `https://ztggj6tg-3000.inc1.devtunnels.ms` | `http://192.168.1.2:4000` |
| Production (`IS_PRODUCTION = true`) | `https://kisko.store` | `https://socket.kisko.store` |

Token: `SCHOOL_PICKUP_API_TOKEN` in `src/config.ts` (must match Kisko-Web `.env`).

## Flow

1. Set the TV device to **School Pickup** in the Kisko web dashboard.
2. Enter that device’s `device_id` in this app.
3. Enter name + class → **School Pickup**.
4. App calls `POST /api/public/school-pickup/enqueue` with `Authorization: Bearer …`.
5. List updates from the response and socket `schoolPickup:queue:update`.

## Note

The older Vite web app (if present) lives in `D:\FDS\school-pickup`. This RN app is `D:\FDS\school-pickup-mobile`.
