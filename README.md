# חליווס – מערכת ספקים וחשבוניות (MVP)

מערכת ניהול חשבוניות, ספקים ותשלומים בסגנון קל, בעברית ו־RTL, מוכנה להתקנה בטלפון (PWA) ולפריסה ל־Vercel.

## הרצה מקומית

1. התקנת חבילות
2. יצירת בסיס נתונים (SQLite) ו־Prisma Client
3. הרצה

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

פתחו http://localhost:3000

## פריסה ל־Vercel

- חברו את הריפו ל־Vercel
- הגדירו משתנה סביבה `DATABASE_URL` (למשל PostgreSQL מ־Vercel / Neon / Supabase)
- אחרי פריסה, הריצו `npx prisma migrate deploy` (דרך Vercel CLI או GitHub Action)

## תכונות MVP

- ספקים: יצירה ורשימה עם יתרות פתוחות
- חשבוניות: הוספה (שורות, מע"מ) ורשימה עם יתרה לכל חשבונית
- תשלומים: הוספה, שיוכים לחשבוניות פתוחות, עדכון סטטוסים
- הוצאות קבועות: הוספה ורשימה
- ממשק בעברית, RTL, צבעים בהירים, פונט Assistant
- PWA: manifest + אייקון – התקנה למסך הבית

## הערות

- פלט צבעים סופי/עיצוב ניתן לעדכן ב־`src/app/globals.css`
- לוגו: `halivas-logo.png` – אפשר להחליף את `public/favicon.svg`
- סכמה: `prisma/schema.prisma`
