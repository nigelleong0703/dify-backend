# Frontend Migration Documentation

This folder contains documentation for building a custom Dify frontend that complies with licensing requirements.

## Documents

1. **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** - Day-by-day roadmap for building the frontend
   - 2-3 week timeline
   - Copy-adapt strategy
   - Phase-by-phase checklist

2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Technical reference and setup instructions
   - Tech stack details
   - Project structure
   - Code examples
   - API integration patterns

## Quick Start

```bash
# 1. Create Next.js project
pnpm create next-app@latest frontend --typescript --tailwind --app --no-src-dir

# 2. Install dependencies
cd frontend
pnpm add @headlessui/react @tanstack/react-query zustand react-hook-form zod ky js-cookie ahooks dayjs lodash-es

# 3. Follow the migration plan
# See MIGRATION_PLAN.md for detailed steps
```

## Strategy

**Copy → Strip Branding → Customize**

Since we're using Next.js 15 (same as Dify), we can copy their code directly and adapt it by removing branding. This is the fastest approach.

## License Compliance

- ✅ Using Dify backend API (permitted)
- ✅ Copying code structure and patterns (same open-source stack)
- ✅ Removing Dify branding (required by license)
- ❌ Not distributing Dify's frontend as-is
- ❌ Not keeping Dify logos/branding

## Timeline

- **Week 1:** Auth + Layout + Navigation
- **Week 2:** Apps + Chat Interface
- **Week 3:** Datasets + Polish + Deploy

## Support

- Dify Documentation: https://docs.dify.ai
- Dify GitHub: https://github.com/langgenius/dify
- Next.js Documentation: https://nextjs.org/docs
