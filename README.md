# חליווס – מערכת ספקים וחשבוניות (MVP)

מערכת ניהול חשבוניות, ספקים ותשלומים בסגנון קל, בעברית ו־RTL, מוכנה להתקנה בטלפון (PWA) ולפריסה ל־Vercel.

## הרצה מקומית

1. התקנת חבילות
2. הגדרת משתני סביבה (ראו `.env.example`)
	- לפיתוח בסיסי: `DATABASE_URL="file:./prisma/dev.db"` (SQLite)
	- עבודה מול Neon מקומי: השאירו `DATABASE_URL` עבור Prisma CLI, והוסיפו `NEON_LOCAL_URL` עם כתובת ה־Postgres המקומית. האפליקציה תרוץ מול `NEON_LOCAL_URL`, ו־Prisma CLI (migrate/generate) ישתמש ב־`DATABASE_URL`.
3. יצירת Prisma Client ומיגרציה מקומית (אם עובדים עם SQLite)
4. הרצה

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

פתחו http://localhost:3000

## פריסה ל־Vercel

- חברו את הריפו ל־Vercel
- הגדירו משתנה סביבה `DATABASE_URL` (PostgreSQL – Neon מומלץ). אין צורך ב־`NEON_LOCAL_URL` בפרודקשן.
- הפקודות בזמן Build אינן משנות סכימה (אין `db push`). כדי לסנכרן סכימה לפרודקשן השתמשו במיגרציות:
	- בצד שלכם: צרו מיגרציה או SQL diff מול DB הפרודקשן.
	- בפרודקשן: הפעילו `prisma migrate deploy` (דרך CI/Action) או הפעילו את ה־SQL ב־Neon Console.

## תכונות MVP

- ספקים: יצירה ורשימה עם יתרות פתוחות
- חשבוניות: הוספה (שורות, מע"מ) ורשימה עם יתרה לכל חשבונית
- תשלומים: הוספה, שיוכים לחשבוניות פתוחות, עדכון סטטוסים
- הוצאות קבועות: הוספה ורשימה
- ממשק בעברית, RTL, צבעים בהירים, פונט Assistant
- PWA: manifest + אייקון – התקנה למסך הבית

## הערות

- פלט צבעים סופי/עיצוב ניתן לעדכן ב־`src/app/globals.css`
- לוגו: `HalivasBrand.png` – אפשר להחליף את `public/favicon.svg`
- סכמה: `prisma/schema.prisma`
- Runtime DB selection: בקוד יש העדפה ל־`NEON_LOCAL_URL` אם מוגדר, אחרת `DATABASE_URL`.
