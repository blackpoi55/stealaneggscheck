# ไข่ไหนอยู่ไบโอมไหน · Steal an Egg Biome Guide

เว็บสองภาษา (ไทย + อังกฤษ แสดงพร้อมกัน ไม่ต้องสลับ) สำหรับดูว่า **ไข่ใบไหนอยู่ไบโอมไหน** ในเกม Steal an Egg
พร้อมรูปไข่จริง เพ็ตจริง และรูปไบโอมจริง — สร้างโดยแมพ **[SweetParadise](https://www.roblox.com/th/games/115633751220614/Sweet-paradise)**

A bilingual (Thai + English shown together) guide to which egg lives in which biome in Steal an Egg,
using the real egg, pet and biome artwork.

## สิ่งที่มี · What's inside

- ไข่ครบ **88 ใบ** ใน **11 ไบโอม** พร้อมเพ็ตที่ฟักออกมา, ระดับความหายาก 10 ระดับ, รายได้ต่อวินาที,
  โบนัสความเร็ว และเงินโบนัสครั้งแรก
- แถบไบโอมติดบน nav แบบ 2 บรรทัด กดแล้วเลื่อนไปที่ไบโอมนั้นทันที พร้อม scroll-spy ไฮไลต์ไบโอมที่กำลังดู
- ค้นหา (ชื่อไข่ / เพ็ต / ไบโอม / ผู้พิทักษ์), กรองตามระดับความหายาก, และเรียงลำดับได้
- Dark mode / Light mode จำค่าที่เลือกไว้ และไม่มีอาการกะพริบตอนโหลด
- กดที่ไข่เพื่อดูรายละเอียดเต็ม พร้อมภาพไบโอมและข้อมูลผู้พิทักษ์
- **เพ็ตลิมิเต็ด 33 ตัว** ที่ไม่ได้มาจากรังในไบโอม — ไข่เบรนร็อต 6, ไข่มอนสเตอร์ 12 (รวมตัว Mecha), ไข่ริฟต์ 15 (3 ชุดหมุนเวียน) พร้อมอัตราออกและวิธีได้มา
- **PWA** ติดตั้งลงหน้าจอโฮมได้ ใช้โลโก้แมพเป็นไอคอน และเปิดดูออฟไลน์ได้หลังเข้าครั้งแรก
- **เช็กลิสต์เก็บไข่** ติ๊ก ✓ บนไข่ที่เก็บได้แล้ว มีความคืบหน้าแยกรายไบโอม + ส่งออก/นำเข้าไฟล์ เก็บไว้ในเครื่อง
- **หน้าไข่แยก URL** `/egg/<id>` ครบ 88 หน้า พร้อม sitemap, robots, JSON-LD และ OG image รายไข่
- **แชร์มุมมองได้** ตัวกรอง/การเรียงถูกเก็บไว้ใน query string เช่น `?rarity=secret,eternal&sort=income-desc`
- **นับผู้เข้าชม + กล่องความคิดเห็น** (ต้องต่อ Neon — ดูหัวข้อด้านล่าง) พร้อมหน้าแอดมินสำหรับซ่อน/ลบคอมเมนต์และบล็อก IP

## เริ่มใช้งาน · Getting started

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## คำสั่ง · Scripts

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | รัน dev server |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production build |
| `npm run lint` | ตรวจ ESLint |
| `npm run assets` | ดาวน์โหลดรูปไข่ / เพ็ต / ไบโอม ลง `public/img` (ข้ามไฟล์ที่มีอยู่แล้ว) |
| `npm run icons` | สร้างไอคอน PWA + favicon จาก `public/img/logo.png` |
| `npm run db:setup` | สร้างตารางใน Neon (รันซ้ำได้ ไม่พัง) |

## โครงสร้าง · Structure

```
src/data/steal-an-egg.ts     ข้อมูลไบโอม ไข่ เพ็ต ทั้งหมด (แหล่งความจริงเดียว)
src/components/SiteNav.tsx   nav + แถบไบโอม 2 บรรทัด + ปุ่มสลับธีม
src/components/Explorer.tsx  ตัวกรอง + ผลลัพธ์ (จัดกลุ่มตามไบโอม)
src/components/EggCard.tsx   การ์ดไข่
src/components/EggDialog.tsx หน้าต่างรายละเอียดไข่
src/app/manifest.ts          web app manifest ของ PWA
public/sw.js                 service worker (แคชหน้าเว็บ + รูป ให้ใช้ออฟไลน์ได้)
scripts/download-assets.mjs  ดึงรูปทั้งหมดมาเก็บไว้ในเครื่อง (ไม่ hotlink)
scripts/build-icons.mjs      แปลงโลโก้เป็นไอคอนทุกขนาด
public/img/{eggs,pets,biomes}  รูปจริง 187 ไฟล์
public/img/logo.png          โลโก้แมพ (ใช้ทั้งบน nav, footer และไอคอนแอป)
```

## วิธีติดตั้งเป็นแอป · Installing

หน้าเว็บมีหัวข้อ **“ติดตั้งเป็นแอป”** (`#install`) ที่บอกขั้นตอนทีละข้อและตรวจว่าผู้ใช้อยู่บนเครื่องอะไร
ถ้าเบราว์เซอร์รองรับจะมีปุ่ม “ติดตั้งเลย” ให้กดได้ทันที สรุปย่อ:

**Windows (Chrome / Edge)**
1. เปิดเว็บด้วย Chrome หรือ Edge
2. กดไอคอนติดตั้งท้ายช่องที่อยู่เว็บ (ถ้าไม่เห็น: เมนู `⋯` → Apps → Install this site as an app)
3. กด “ติดตั้ง” แล้วแอปจะไปอยู่ใน Start menu

**iPhone / iPad (ต้องใช้ Safari)**
1. เปิดด้วย Safari — Chrome บน iOS ติดตั้งไม่ได้
2. กดปุ่มแชร์ที่แถบล่าง
3. เลื่อนหา “เพิ่มไปยังหน้าจอโฮม” (Add to Home Screen) แล้วกด “เพิ่ม”

**Android (Chrome)**
1. เปิดด้วย Chrome
2. กดเมนู `⋮` มุมขวาบน
3. เลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอหลัก” แล้วกด “ติดตั้ง”

> ต้องเสิร์ฟผ่าน **HTTPS** (หรือ `localhost`) และต้องเป็น production build เบราว์เซอร์จึงจะเสนอให้ติดตั้ง

## ฐานข้อมูล Neon · Visitor counter & comments

ส่วนนับผู้เข้าชมและกล่องความคิดเห็นต้องมีฐานข้อมูล Postgres จาก [Neon](https://neon.tech)
**ถ้าไม่ตั้งค่า เว็บยังใช้ได้ปกติทุกอย่าง** แค่สองส่วนนี้จะไม่แสดงเท่านั้น

1. สมัคร Neon แล้วสร้าง project (ฟรี) คัดลอก **pooled connection string**
2. สร้างไฟล์ `.env.local` โดยดูตัวอย่างจาก `.env.example`

   ```bash
   DATABASE_URL=postgresql://...        # จาก Neon
   IP_SALT=สุ่มยาว ๆ                     # ใช้แฮช IP
   ADMIN_TOKEN=รหัสของคุณ                # รหัสเข้า /admin
   NEXT_PUBLIC_SITE_URL=https://โดเมนของคุณ
   ```

3. สร้างตาราง: `npm run db:setup`
4. รีสตาร์ท dev server หนึ่งครั้งเพื่อให้อ่านค่า `.env.local`

ตอน deploy จริง (Vercel/อื่น ๆ) อย่าลืมใส่ตัวแปรทั้ง 4 ตัวนี้ในหน้า Environment Variables ของโฮสต์ด้วย
และเปลี่ยน `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง

### ตารางที่ใช้

| ตาราง | เก็บอะไร |
| --- | --- |
| `visits` | 1 แถวต่อผู้เข้าชม 1 คนต่อวัน (`visitor_hash` = แฮชของ IP+เบราว์เซอร์) ใช้นับยอด |
| `comments` | ชื่อ, ข้อความ, `ip` (ดิบ), `ip_hash`, user agent, สถานะซ่อน |
| `blocked_ips` | รายการ IP ที่ถูกบล็อก |

### หน้าแอดมิน

เข้า `/admin` แล้วใส่ `ADMIN_TOKEN` จะเห็นคอมเมนต์ทั้งหมดพร้อม IP และปุ่ม **ซ่อน / ลบ / บล็อก IP**
เมื่อบล็อกแล้ว คอมเมนต์เดิมของ IP นั้นจะถูกซ่อนทั้งหมด และ `src/middleware.ts` จะกันไม่ให้เข้าเว็บได้อีก
(แคชรายชื่อไว้ 60 วินาที และถ้าต่อฐานข้อมูลไม่ได้จะ **ปล่อยผ่าน** เสมอ เพื่อไม่ให้คนทั่วไปถูกล็อกออก)

ถ้าไม่ได้ตั้ง `ADMIN_TOKEN` API แอดมินจะถูกปิดทั้งหมด — ไม่มีทางเปิดโล่งโดยไม่ตั้งใจ

### เรื่องความเป็นส่วนตัว

- IP ดิบเก็บไว้ฝั่งเซิร์ฟเวอร์อย่างเดียว ไม่เคยส่งออกไปหน้าเว็บสาธารณะ — มีเฉพาะหน้าแอดมินที่เห็น
- ที่ระบบใช้จับคู่จริง ๆ คือ `ip_hash` (SHA-256 + `IP_SALT`) ไม่ใช่ IP ดิบ
- ใต้ฟอร์มมีข้อความแจ้งผู้ใช้ว่ามีการบันทึก IP เพื่อป้องกันการก่อกวน
- กันสแปมด้วย honeypot + จำกัด 5 คอมเมนต์/ชั่วโมง/IP

## PWA

- `manifest.webmanifest` มาจาก `src/app/manifest.ts` — ชื่อ, ไอคอน 192/512/maskable, `display: standalone`
- Service worker (`public/sw.js`) ลงทะเบียนเฉพาะตอน production เท่านั้น
  (บน dev server ไฟล์ chunk เปลี่ยนตลอด แคชไว้จะกวน) — ทดสอบด้วย `npm run build && npm run start`
- กลยุทธ์แคช: หน้าเว็บใช้ network-first (ออฟไลน์ค่อยดึงของเดิม) ส่วน `/img/`, `/icons/`,
  `/_next/static/` ใช้ cache-first แล้วอัปเดตเบื้องหลัง — ถ้าแก้กติกาแคช ให้เปลี่ยนเลข `CACHE` ใน `sw.js`
- ไอคอนสร้างใหม่ได้ด้วย `npm run icons` (ไฟล์ `logo.png` จริง ๆ เป็นข้อมูล WebP — sharp อ่านฟอร์แมตจริงเอง
  ไอคอนที่ได้จึงเป็น PNG แท้)

รูปทั้งหมดถูกดาวน์โหลดมาไว้ใน `public/` แล้ว เว็บจึงไม่ต้องดึงรูปจากเซิร์ฟเวอร์ภายนอกตอนรัน

## แหล่งข้อมูล · Data sources

- [Eldorado — Steal an Egg Eggs List](https://www.eldorado.gg/blog/steal-an-egg/steal-an-egg-eggs-list/) (รูปไข่)
- [Eldorado — All Pets Index](https://www.eldorado.gg/blog/steal-an-egg/steal-an-egg-all-pets-index/) (รูปเพ็ต, รายได้ต่อวินาที)
- [IGN Wiki — All Biomes](https://www.ign.com/wikis/steal-an-egg-roblox/All_Biomes) (รูปไบโอม, ผู้พิทักษ์, ความเร็วที่แนะนำ, โบนัสความเร็ว)

- [IGN Wiki — All Eggs](https://www.ign.com/wikis/steal-an-egg-roblox/All_Eggs) (อัตราออกของไข่ลิมิเต็ด)
- [IGN Wiki — All Pets](https://www.ign.com/wikis/steal-an-egg-roblox/All_Pets) (รายได้/ความเร็วของเพ็ตลิมิเต็ด)

### หมายเหตุเรื่องข้อมูล

- **เงินโบนัสครั้งแรก** ไม่ได้เก็บไว้ เพราะทุกรายการในแหล่งอ้างอิงเป็น `รายได้ต่อวินาที × 100` พอดี จึงคำนวณเอา
  (ยืนยันจากในเกม: Scorpio $10K/s → $1M)
- **โบนัสความเร็วของ Scorpion** (ไบโอมทะเลทราย) วิกิไม่มีข้อมูล จึงแสดงเป็น `—`
- **ไข่เบรนร็อตกับไข่มอนสเตอร์** วิกิเขียนช่อง "Money per second" ว่า Unknown ทั้งหมด รายได้ในเว็บนี้จึงคำนวณ
  จากเงินโบนัส ÷ 100 (ทำเครื่องหมาย `derived: true` ไว้ในข้อมูล)
- **Froggo** วิกิพิมพ์เงินโบนัสเป็น `$5` ซึ่งตกหล่นแน่นอน — ตัว Mecha ทุกตัวทำเงินเป็น 2 เท่าของตัวธรรมดาพอดี
  และ Mecha Froggo = $10M ดังนั้น Froggo = $5M → $50K/s
- **เพ็ตฝั่ง Rift** ใช้ภาพการ์ดจากในเกมซึ่งมีอัตราออกและรายได้ติดมาในรูปอยู่แล้ว เว็บจึงไม่ซ้อนป้ายทับ

เว็บนี้เป็นแฟนไซต์ ไม่ได้สังกัดผู้พัฒนาเกม · Unofficial fan site. Steal an Egg and Roblox are trademarks of
their respective owners.
