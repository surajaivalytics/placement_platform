# 🔧 Database Authentication Fix Guide

## 🚨 Problem Summary

**Error:** `Login failed: CredentialsSignin` with 401 Unauthorized

**Root Cause:** Database authentication failure - the password in your `.env` file is incorrect.

**Error Details:**
```
PrismaClientKnownRequestError: P1000
"password authentication failed for user 'postgres'"
PostgreSQL Error Code: 28P01 (AuthenticationFailed)
```

---

## ✅ Solution Steps

### Step 1: Get Your Correct Supabase Password

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `swexktlzarqksjdxzsiu`
3. Navigate to: **Settings** → **Database** → **Connection string**
4. Look for the **Connection pooling** section
5. Copy the **password** (it's NOT "surajGholase")

### Step 2: Update Your `.env` File

Open `d:\p-p\placement_platform\.env` and replace `[YOUR_ACTUAL_PASSWORD]` with your real password:

```bash
# Before (INCORRECT):
DATABASE_URL="postgresql://postgres.swexktlzarqksjdxzsiu:[YOUR_ACTUAL_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# After (with your real password):
DATABASE_URL="postgresql://postgres.swexktlzarqksjdxzsiu:YOUR_REAL_PASSWORD_HERE@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

**Update BOTH:**
- `DATABASE_URL` (for connection pooling)
- `DIRECT_URL` (for direct connection)

### Step 3: Restart Your Development Server

After updating the `.env` file:

1. **Stop** the current dev server (Ctrl+C in the terminal)
2. **Restart** it:
   ```bash
   npm run dev
   ```

### Step 4: Test the Connection

Once the server restarts, you should see:
```
✅ Database connected successfully
```

If you still see errors, the password is still incorrect.

---

## 🔍 How to Verify It's Fixed

1. **Check Terminal Output:**
   - Look for: `✅ Database connected successfully`
   - Should NOT see: `❌ Database connection failed`

2. **Try Logging In:**
   - Go to: http://localhost:3000/login
   - Enter valid credentials
   - Should NOT see: `Login failed: CredentialsSignin`

3. **Check Browser Console:**
   - Should NOT see: `Failed to load resource: 401 (Unauthorized)`

---

## 📝 Alternative: Reset Your Supabase Password

If you can't find your password:

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Click **"Reset Database Password"**
3. Copy the new password
4. Update your `.env` file with the new password
5. **Important:** This will invalidate any other connections using the old password

---

## 🎯 Quick Checklist

- [ ] Found correct password from Supabase dashboard
- [ ] Updated `DATABASE_URL` in `.env`
- [ ] Updated `DIRECT_URL` in `.env`
- [ ] Restarted dev server (`npm run dev`)
- [ ] Saw "Database connected successfully" message
- [ ] Tested login - no more 401 errors

---

## 🆘 Still Having Issues?

If you're still getting errors after following these steps:

1. **Check for typos** in the password (no extra spaces, correct case)
2. **Verify the connection string format** matches exactly
3. **Check Supabase project status** - ensure it's not paused
4. **Try the DIRECT_URL** instead of DATABASE_URL temporarily
5. **Check firewall/network** - ensure you can reach Supabase servers

---

## 📚 Technical Details

**What was happening:**
- When you tried to log in, NextAuth called the `authorize` function
- This function tried to query the database with `prisma.user.findUnique()`
- Prisma tried to connect to PostgreSQL using the credentials in `.env`
- PostgreSQL rejected the connection because the password was wrong
- The query failed, returning `null` to NextAuth
- NextAuth interpreted this as invalid credentials → `CredentialsSignin` error

**Why it showed as a login error:**
- The actual database connection error was hidden behind the generic "CredentialsSignin" error
- The detailed error was only visible in the `auth_debug.log` file
- This is why it appeared as a login problem rather than a database problem

---

**Last Updated:** 2026-01-18
