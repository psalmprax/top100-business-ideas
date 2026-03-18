# Pricing Strategy: MediParse (Medical Coding AI)

## 💰 Pricing Philosophy

### Core Principles
1. **Value-Based Pricing**: Hospitals measure their pain in millions of dollars (DNFB - Discharged Not Final Billed). We price as a fractional percentage of the massive revenue we unlock for them, not based on our cloud compute costs.
2. **"No Rip and Replace"**: We do not force them to fire their human coders. We position ourselves as a "Copilot" that makes their human coders 10x faster, avoiding union/staffing friction.
3. **No Per-Seat Licenses**: Coding teams fluctuate, and outsourced BPOs have high turnover. We charge solely based on the Volume of Medical Charts processed.

---

## 📊 Pricing Tiers

### The Consumption Model
*Note: Pricing scales drastically based on the complexity of the medical specialty. A simple X-Ray is cheap to code; a 40-day ICU stay is incredibly expensive to code.*

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Radiology / Pathology** | £0.50 per chart | High volume, low complexity. Automated matching. | Outpatient imaging centers. |
| **Emergency Dept (ED)** | £2.00 per chart | Medium complexity. High volume. | Regional hospital ERs. |
| **Inpatient / Complex** | £15.00 per chart | Extrapolating 100+ pages of notes into DRGs (Diagnosis-Related Groups). | Mega-Hospital systems. |

### The Enterprise SLA Model
Hospitals hate variable costs because they break their annual budgets. We convert the consumption model into a flat Annual Contract Value (ACV).

| Tier | Base Contract | Volume Limit | Overage |
|------|---------------|--------------|---------|
| **Regional System** | £180,000 / year | 100,000 charts/yr | £2.50 / chart |
| **National Network**| £500,000+ / year| Unlimited | N/A |

---

## 💵 Unit Economics by Tier

### Cloud Compute Margins
Processing a 10-page text chart through Azure OpenAI costs approximately £0.05. If we charge £2.00 for that chart, our margins are staggering.

| Tier | Gross Margin | Rationale |
|------|--------------|-----------|
| Outpatient | 75% | Lower price point means Azure API costs eat a larger percentage. |
| ER / Inpatient| 95%+ | The computational cost difference between a 10-page chart and a 50-page chart is pennies, but we charge £13 more. |

---

## 🎯 Pricing Psychology

### Objection Handling
- **"£180,000 a year is more than my entire IT software budget."**
  - **Rebuttal**: "You currently have 12 outsourced coders in India costing you £300,000 a year, and your denial rate is 15% costing you £2 Million a year. We aren't IT software; we are Revenue Cycle infrastructure. We guarantee a positive ROI in 90 days or you can cancel."

---

## 📈 Competitor Pricing

| Competitor | Pricing Model | Weakness | Our Advantage |
|------------|---------------|----------|---------------|
| **Offshore Human BPOs (India/Philippines)**| £10 - £15 per hour | Massive error rates, timezone delays causing cash-flow bottlenecks. | We cost £0.50 a chart and operate instantly 24/7. |
| **Legacy Rules Engines (3M)** | Massive multi-million flat fees | Requires human data entry *before* the engine works. | We read the raw, messy unstructured text directly. |
