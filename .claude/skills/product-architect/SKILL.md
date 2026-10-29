---
name: product-architect
description: Design a genuinely client-specific digital product (website, catalogue, booking/ordering flow, portal, internal tool) from a client brief — goals, users, competitors, functionality, content, design direction, technology, hosting, integrations, costs and risks — comparing at least two approaches before choosing. Use after client-discovery, when writing a proposal or scope, when choosing a stack/CMS/platform, or when a client asks "what should we build". Phase 2 of agency-delivery. Not for visual styling details (use frontend-design) or tracking setup (use site-analytics).
---

# Product architect

Output: `solution.md` in the client folder (template: `templates/solution-design.md`). The goal is the **smallest product that moves the client's main metric**, built so it can grow — not the agency's favourite template.

## Inputs (check before designing)
The client brief (phase 1) with Verified facts, the delivery log, `00-Shared/Lessons/LESSONS.md`, and the agency defaults below. If the brief is missing key facts (goal metric, budget range, who edits content), stop and list them as open questions.

## Method
1. **Restate the job**: main business goal + metric, primary users and their top 3 tasks, constraints (budget range, deadline, who maintains content, legal).
2. **Map functionality to goals**: list candidate features; keep only those tied to a goal or a user task. Mark each Must / Should / Later. Challenge features that exist only because competitors have them.
3. **Content and data**: where content and product data come from (spreadsheets, CMS, ERP/accounting exports, Shopify), who updates it, how often; licensing of images/fonts; what must never be published (prices without confirmation, private exports).
4. **Generate ≥2 genuinely different approaches**, e.g. (a) static/SSG site on the agency stack, (b) hosted builder or Shopify/WordPress the client can edit, (c) custom app/portal — plus "do less / phase it". For each: fit to goals, client editing experience, build time, running cost/month, lock-in, maintenance burden, risks.
5. **Research only what changes the decision**: current versions, pricing/plan limits, licensing and terms (e.g. hosting plans that forbid commercial use), integration APIs. Cite and date sources; mark unverified as Estimate. Prefer mature, widely used options.
6. **Choose** with business-advisor's comparison table; state why the rejected options lost and what would change the choice.
7. **Architecture**: pages/routes and key flows, data model, integrations, hosting/region, environments (Preview/Production), analytics/consent (site-analytics), accessibility and performance budgets (Lighthouse ≥90 mobile on key pages, CLS ≈ 0), security (secrets in env vars only), backups/rollback.
8. **Reuse deliberately**: list proven agency components that fit (e.g. from Aspect ES: blueprint `PageHero`, `VisitPanel`, product browser with client-side search, name-derived product renders, analytics gateway, Playwright release suite). Reuse code patterns, not brand; the design direction comes from this client's subject (frontend-design).
9. **Plan and price**: milestones mapped to agency-delivery phases, effort ranges, running costs, what the client must provide, risks with mitigations. Mark all as Estimate.
10. **Get approval**: the solution is a proposal until the owner/client approves; record the approval in the delivery log.

## Agency defaults (override when the client's needs differ — say why)
- Next.js + TypeScript + Tailwind on Vercel for custom sites; Playwright for release tests; Git per client.
- Client-owned domain, hosting billing and analytics where possible.
- No invented business facts; illustrative images labelled as such; exact product photos only with reuse permission.
- EU region hosting for EU audiences when it matters for latency or data residency.

## Done when
`solution.md` has ≥2 compared approaches, a chosen approach with reasons and reversal triggers, scope in/out, architecture, cost/time ranges, risks, client inputs, and an approval line (pending or quoted).
