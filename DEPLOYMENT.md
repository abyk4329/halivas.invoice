# Vercel Deployment Guide - חליווס

## מה כבר בוצע ✅
- הקוד דחוף ל-GitHub בענף `fixes-and-improvements`
- Vercel CLI מותקן ומוכן
- הפרויקט מקושר ל-Vercel (halivas)
- קובץ `vercel.json` נוצר

## שלבים לסיום הפריסה

### 1. הגדרת בסיס נתונים לפרודקציה
בחר אחת מהאפשרויות:

**אפשרות א: Neon (PostgreSQL - מומלץ)**
1. לך ל-https://neon.tech
2. צור חשבון והדרת פרויקט
3. העתק את ה-`DATABASE_URL` (כמו `postgresql://username:password@host/database`)

**אפשרות ב: Vercel Postgres**
1. בלוח הבקרה של Vercel, לך לפרויקט halivas
2. לך ל-Storage > Create Database > Postgres
3. העתק את ה-`DATABASE_URL`

**אפשרות ג: Supabase**
1. לך ל-https://supabase.com
2. צור פרויקט חדש
3. בהגדרות, קח את ה-Database URL

### 2. הגדרת משתני סביבה ב-Vercel
1. לך ללוח הבקרה של Vercel: https://vercel.com/dashboard
2. בחר בפרויקט "halivas"
3. לך ל-Settings > Environment Variables
4. הוסף:
   - **Name**: `DATABASE_URL`
   - **Value**: [ה-URL שקיבלת מבסיס הנתונים]
   - **Environments**: Production, Preview, Development

### 3. פריסה מחדש
אחרי הגדרת ה-DATABASE_URL, הרץ:
```bash
cd "/Users/kseniachudnovskaya/Desktop/CODE/Active Projects/halivas.invoice"
npx vercel --prod
```

### 4. ביצוע מיגרציות (חד פעמי)
אחרי פריסה מוצלחת:
```bash
# התחברות לעורך הפקודות של Vercel
npx vercel env pull .env.production
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2-) npx prisma migrate deploy
```

## בדיקת הפריסה
אחרי פריסה מוצלחת:
1. הכנס לכתובת שה-Vercel מציג
2. בדוק שהדף הראשי נטען
3. נסה ליצור ספק חדש
4. בדוק שהנתונים נשמרים

## פתרון בעיות נפוצות

**שגיאה: "Environment Variable DATABASE_URL not found"**
- ודא שהגדרת את משתנה הסביבה ב-Vercel Dashboard

**שגיאה: "Can't reach database server"**  
- בדוק שה-DATABASE_URL נכון ושבסיס הנתונים פועל

**שגיאה: "Table doesn't exist"**
- הרץ `npx prisma migrate deploy` עם ה-DATABASE_URL של הפרודקציה

## קישורים שימושיים
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech/)
- [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)
