# BOLT FOOD - SALES → AM HANDOVER REDESIGN

**Complete Process Documentation for Flow Generation**

- **Document Purpose:** Complete specification for automated handover system implementation
- **Target Use:** Claude Code flow generation + Figma/Miro flowchart creation
- **Candidate:** Leo
- **Date:** February 2026

---

## EXECUTIVE SUMMARY

### The Problem

Broken handover from Sales to Account Management costs Bolt Food **€1.4M annually**:

- **€403k/year** in operational inefficiency (wasted time)
- **€1M/year** in early partner churn (lost LTV)
- **28%** of SMB partners escalate due to "broken promises"
- Systematic failure in information transfer

### The Solution

**Automated Handover Pipeline** with three pillars:

1. **Structured Input Layer** - AI extraction + hard gates eliminate entropy
2. **Automated Handover Bridge** - Zero-touch for SMB, white-glove for Enterprise
3. **Closed-Loop Audit** - Continuous learning + rapid error correction

### Key Metrics

- **Investment:** €80k setup + €5k/month ongoing
- **ROI:** Payback in 3 months (conservative 30% problem resolution)
- **North Star Metric:** % of partners achieving 21 orders in <21 days (TT21)
- **Automation Coverage:** 95% SMB | 60-75% MM | 20% Enterprise

---

## SECTION 1: DIAGNOSIS & ROOT CAUSES

### 1.1 Four Structural Problems

#### Root Cause #1: Perverse Incentives

- **SM Compensation:** Rewarded for "Closed Won" deals, NOT handover quality
- **Misaligned KPIs:** AM success (partner retention) not part of SM metrics
- **Principal-Agent Problem:** SMs view CRM data entry as friction, not enablement
- **Unstructured Information:** Critical data lives in call audio and SM memory, not systems

#### Root Cause #2: Information Entropy

- **Multi-Channel Negotiation:** Terms discussed across calls, emails, WhatsApp messages
- **Inconsistent Capture:** Data captured inconsistently in Salesforce (or not at all)
- **Lost in Translation:** Information disappears between SM and AM
- **Result:** 38% of SMB handovers missing critical information → Broken promises → Churn

#### Root Cause #3: Scale vs. White Glove Mismatch

- **SMB Reality:** Requires zero-touch automation (1000+ handovers/month, volume play)
- **Enterprise Reality:** Demands human-in-the-loop (complex multi-location deals, relationship play)
- **Current System:** One-size-fits-all process fails both segments

#### Root Cause #4: Lack of Organizational Learning

- **No Feedback Loop:** Information not stored in structured database
- **Manager Blindness:** Cannot identify where specific sales agents are failing
- **No Development Plans:** Lack of metrics prevents targeted SDR training
- **Lost Context:** Conversations not consolidated, AM cannot understand merchant fears/needs
- **Strategic Intelligence Gap:** No way to extract market insights for S&P, Product, Intel teams

**Impact:** System cannot improve, patterns repeat, institutional knowledge lost

### 1.2 The €1.4M Problem (Quantified)

#### Assumptions (Conservative, Industry-Benchmarked)

- SMB handovers: 1,000/month
- Escalation rate: 28% (280 cases/month)
- Cost per escalation: 3h (AM archaeology + SM review) × €40/h = €120
- Churn rate from escalations: 10% (28 partners/month)
- LTV per SMB partner: €3,000

#### Annual Cost Breakdown

| Cost Category | Calculation | Annual Impact |
|--------------|-------------|---------------|
| **Wasted Time (OpEx)** | 280 escalations × €120 × 12 months | **€403,200/year** |
| **Churn Revenue Lost** | 28 partners × €3,000 LTV × 12 months | **€1,008,000/year** |
| **TOTAL COST** | | **€1,411,200/year** |

### 1.3 Segment Prioritization: Why SMB First

| Segment | % Missing Info | Escalations | Volume | Ticket Size | Priority |
|---------|---------------|-------------|---------|-------------|----------|
| **SMB** | 38% | 28% | HIGH | Low | **1 - URGENT** |
| **Mid-Market** | 25% | 17% | Medium | Medium | 2 |
| **Enterprise** | 12% | 10% | Low | HIGH | 3 |

#### Strategic Rationale

1. **Death by Thousand Cuts:** High volume × high error rate = maximum damage
2. **Highest Automation ROI:** Standardized process enables zero-touch flow
3. **Scale Effect:** Fixing SMB frees 80% of AM capacity for Enterprise white-glove
4. **Validation Vehicle:** Prove automation model before rolling to MM/Enterprise

---

## SECTION 2: SOLUTION ARCHITECTURE

### 2.1 Three Pillars (MECE Framework)

---

## PILLAR 1: STRUCTURED INPUT LAYER

**Objective:** Eliminate information entropy at source through automated capture + validation

### Component 1.1: AI Call Transcription & Extraction

#### System Integration

- **Tool:** Gong/Chorus integration with Salesforce
- **Trigger:** Auto-record all sales calls (discovery, negotiation, closing)
- **Process:** Real-time transcription → AI extraction → Field population

#### Data Extraction (Comprehensive Merchant Profile)

**Contract Terms:**
- Commission percentage
- Campaign type & duration
- Tablet inclusion (Y/N)
- Special clauses/promises
- Contract length

**Business Intelligence:**
- Merchant size (revenue, employees, locations)
- Current sales volume estimate
- Competitors where they also sell (UberEats, Deliveroo, Glovo, etc.)
- Benefits they have over other competitors
- What works/doesn't work with success ops in other marketplaces
- Their goals and objectives in starting with Bolt

**Merchant Profile (For AM Growth Plan):**
- Owner personality traits (risk-averse, growth-oriented, price-sensitive, etc.)
- Primary motivations (revenue growth, customer reach, operational efficiency)
- Main concerns/fears (delivery times, commission rates, competition)
- Decision-making triggers (what made them choose Bolt)
- Expected order volume
- Growth aspirations (expansion plans, additional locations)

**Market Intelligence (For S&P/Product Teams):**
- Pricing sensitivity and elasticity
- Competitor positioning in their segment
- Cuisine type and local market density
- Geographic area insights (neighborhood characteristics)
- Product/feature requests mentioned

#### Output

- **Salesforce:** All fields auto-populated with confidence score
- **Merchant Profile:** Structured JSON document with business context
- **Market Intel:** Data tagged for S&P, Sales Ops, Product teams

---

### Component 1.2: Sales Co-Pilot (Real-Time AI Assistant)

#### Functionality

**During Active Calls:**
- **Visible to:** SDR only (not merchant)
- **Real-time Analysis:** Monitors conversation flow, detects objections
- **RAG-Powered Suggestions:** Based on historical successful closures
- **Argument Library:** Suggests responses to objections drawn from top-performing SDRs

#### Two Modes

**Mode A: Deal Not Closing**

- **Trigger:** SDR struggling with objections, merchant hesitating
- **Actions:**
  - Identify main objection trigger (price, competition, delivery concerns)
  - Surface winning arguments from similar past cases
  - Suggest questions to uncover real concerns
  - Provide competitive positioning data
- **Data Collection:** Capture merchant behavior patterns for future analysis
- **Output:** Intelligence for retry strategies + market insights

**Mode B: Deal Closing**

- **Trigger:** Merchant agreeing to terms, moving to contract
- **Actions:**
  - Validate all required fields captured
  - Flag any missing critical information
  - Suggest next-best-action (send contract, schedule follow-up)
- **Output:** Complete merchant profile + contract readiness confirmation

#### Learning Loop

- **Training Data:** Transcripts from top 10% performing SDRs
- **Continuous Learning:** New successful closes feed back into RAG system
- **Pattern Recognition:** Identifies winning phrases, objection-handling techniques
- **SDR Development:** Flags areas where specific SDRs need coaching

---

### Component 1.3: Hard Gate #1 (Pre-Contract Generation)

#### Gate Logic

**IF Deal Not Closed:**
- **System Action:** Generate retry intelligence report
- **Content:**
  - Main trigger/objection identified
  - Merchant behavior pattern (price-focused, competitor-loyal, risk-averse)
  - Suggested arguments from historical data
  - Recommended follow-up timing
- **Routing:** Report to SDR + Sales Manager for retry strategy

**IF Deal Closed:**
- **Validation Required:**
  - ✅ All contract terms confirmed (commission, campaign, tablet, duration)
  - ✅ Merchant profile complete (goals, fears, competitors, motivations)
  - ✅ AI confidence >90% OR Sales Ops review complete (<90%)
- **Blocking Mechanism:** SM cannot advance to "Closed Won" without confirmation
- **Manual Override:** Requires Sales Manager approval + justification

#### Confidence Threshold Logic

```python
IF AI_confidence >= 90%:
    → Auto-fill fields
    → SM reviews and confirms
    → Proceed to contract generation

ELIF AI_confidence < 90%:
    → Flag for Sales Ops manual review (2h SLA)
    → Sales Ops corrects/completes fields
    → SM confirms corrections
    → Proceed to contract generation

ELSE (Deal not closed):
    → Generate retry intelligence
    → Route to SDR for follow-up
    → Do NOT proceed to contract
```

---

### Component 1.4: AI Contract Auditor

#### Functionality

- **Input:** Signed contract + call transcript(s)
- **Process:** NLP comparison of verbal promises vs. written terms
- **Output:** Discrepancy report (if any)

#### Discrepancy Handling

```python
IF discrepancy_detected:
    → Create review ticket in Salesforce
    → Assign to Sales Ops with priority flag
    → Include:
        - Timestamp of verbal promise in call
        - Exact contract clause that differs
        - Severity rating (High/Medium/Low)
    → Does NOT block deal (avoids false positive paralysis)
    → Flags for post-signature correction before Go-Live

ELSE:
    → Mark contract as validated
    → Proceed to handover prep
```

**Key Design Principle:** AI suggests, human validates → Eliminates 90% of manual entry while maintaining accuracy

---

### Component 1.5: Merchant Profile Document

#### Structure (JSON Format)

```json
{
  "merchant_id": "M-12345",
  "merchant_name": "Pizzaria do Bairro",
  "segment": "SMB",
  "contract_terms": {
    "commission": "12%",
    "campaign": "15% discount for 60 days",
    "tablet": "Free (Model T-200)",
    "contract_length": "12 months"
  },
  "business_context": {
    "current_revenue": "€350k/year estimate",
    "employees": "8 staff",
    "competitors_active": ["UberEats", "Glovo"],
    "competitor_benefits": "Faster delivery times in local area",
    "goals": ["Reach new customers", "Increase weekend orders"],
    "expected_orders": "50-60/week"
  },
  "owner_profile": {
    "personality": "Growth-oriented, price-sensitive",
    "main_concerns": ["Commission structure", "Delivery reliability"],
    "decision_triggers": ["Competitor delivery delay", "Bolt's local market share"],
    "motivations": ["Revenue growth", "Brand visibility"]
  },
  "market_intelligence": {
    "cuisine_type": "Italian/Pizza",
    "neighborhood": "Bay Ridge, Brooklyn",
    "price_sensitivity": "High",
    "expansion_potential": "Considering 2nd location in 12 months"
  },
  "ai_metadata": {
    "extraction_confidence": "94%",
    "extraction_date": "2026-02-12T14:30:00Z",
    "source_calls": ["call-001", "call-002"],
    "human_review_required": false
  }
}
```

#### Usage

- **AM Team:** Growth plan development, personalized onboarding
- **Success Team:** Proactive intervention strategies, churn prediction
- **S&P Team:** Pricing insights, market density analysis, competitive intelligence
- **Sales Ops Team:** Territory planning, SDR performance benchmarking
- **Product Team:** Feature prioritization based on merchant needs

---

### Impact Summary: Pillar 1

- **Manual Entry:** Reduced from 15 min/deal → <2 min (review only)
- **Data Completeness:** 38% missing info → Target <5% by D90
- **Merchant Intelligence:** Zero structured data → Comprehensive profile for every partner
- **Organizational Learning:** No feedback loop → Continuous SDR improvement + market insights

---

## PILLAR 2: AUTOMATED HANDOVER BRIDGE

**Objective:** Near zero-touch activation for SMB; Intelligent dashboards for MM/Enterprise

---

### 2.2.1 SMB Path (Happy Path - 95% Automated)

#### Trigger Event

**Contract Signature (DocuSign)** → Automated workflow activation

#### Automated Workflow Steps

**Step 1: Data Validation (Hard Gate #2)**

```python
VALIDATE:
  - 100% of mandatory fields populated in Salesforce
  - Merchant profile JSON complete
  - Contract terms match AI extraction

IF validation_pass:
  → Proceed to configuration
ELSE:
  → Block Go-Live
  → Notify SM to complete missing fields
  → Log exception in daily report
```

**Step 2: Billing Configuration (Automated)**
- **System:** Salesforce → Billing API
- **Action:** Auto-configure commission structure
- **Data:** Commission %, effective date (D0), billing cadence
- **Validation:** Commission appears in billing dashboard

**Step 3: Merchant Profile Creation**
- **System:** AI Generator → CRM Knowledge Base
- **Action:** Store structured merchant profile
- **Content:** Goals, investment capacity, competitors, sales context
- **Access:** Available to AM, Success Team, Sales Ops

**Step 4: Campaign Scheduling (Automated)**
- **System:** Campaign Management Tool
- **Action:** Schedule promotion activation for D0 (Go-Live)
- **Data:** Campaign type, discount %, duration
- **Status:** Campaign queued (not active until Go-Live)

**Step 5: Tablet Activation Prep (Automated)**
- **System:** Tablet Management System
- **Action:** Queue tablet for D0 activation
- **Configuration:** Single location, standard menu template
- **Logistics:** Tablet shipped 2 days before Go-Live

**Step 6: Handover Dossier Generation (AI)**
- **System:** AI Summary Generator
- **Input:** Merchant profile + contract + call transcripts
- **Output:** "30-Second Handover Dossier" (see template below)
- **Distribution:** Sent to assigned AM via Salesforce → Slack + Email

**Step 7: AM Notification (Automated)**
- **Channel:** Slack notification + Email
- **Message:** "Partner X goes live tomorrow at 2PM"
- **Attachments:** Handover dossier, merchant profile, contract summary
- **Action Required:** Review dossier, schedule D+1 onboarding call

#### Total Handover Prep Time

**<10 minutes** (vs 4.5 days current state)

---

### 2.2.2 Mid-Market Path (Hybrid - 60-75% Automated)

#### Differences from SMB

**Additional Human Touchpoints:**

**1. Sales Ops Review (Pre-Activation)**
- **Trigger:** AI confidence <90% OR custom terms negotiated
- **Action:** Sales Ops manually reviews AI extraction
- **Validation:** Confirms accuracy before proceeding to configuration
- **Output:** Corrected data with 100% confidence

**2. BPO External Agent (RLHF Process)**
- **Purpose:** Improve AI model through human feedback
- **Trigger:** Information missed by AI or extraction errors
- **Actions:**
  - Review why AI failed (missing context, unclear audio, complex terms)
  - Add few-shot examples to training data
  - Insert chain-of-thought prompts for similar cases
  - Act as human evaluator (RLHF - Reinforcement Learning from Human Feedback)
- **Output:** Continuously improving extraction model

**3. AM Dashboard Review**
- **Content:** "Executive Summary Dashboard" showing:
  - Negotiation difficulty score (based on call length, back-and-forth)
  - Specific promises highlighted
  - Merchant concerns flagged
  - Recommended onboarding approach
- **Action:** AM validates setup before Go-Live
- **Decision:** Some complex campaigns require manual configuration

#### Automation Level

60-75% automated (depends on deal complexity)

---

### 2.2.3 Enterprise Path (White Glove - 20% Automated)

#### Human-in-the-Loop at Every Stage

**1. AI Assists, Human Decides**
- AI transcribes calls but SM manually fills fields
- AI suggests terms, SM validates and customizes
- Multiple calls (4+ typical) → AI aggregates insights across all

**2. Multi-Stage Approvals**
- Legal team reviews complex contracts before signature
- Finance Ops manually configures tiered commission structures
- Sales Ops + AM conduct internal kickoff call pre-Go-Live

**3. Dedicated AM Assignment**
- Not shared AM pool - single dedicated AM
- AM present at activation (remote or in-person)
- Ongoing relationship management (weekly calls, quarterly reviews)

#### Why Low Automation Makes Sense

- Deal size (€2.8M) justifies human investment
- Complexity (47 locations, tiered pricing) exceeds AI capabilities
- Strategic partnership requires relationship depth

---

### 2.2.4 Handover Dossier Template (SMB Example)

```
┌────────────────────────────────────────────────┐
│ 📋 SMB HANDOVER - ZERO TOUCH COMPLETE         │
├────────────────────────────────────────────────┤
│ Partner: Pizzaria do Bairro                   │
│ Type: SMB | Single Location | Standard Package│
│ Go-Live: Tomorrow 14:00 CET                    │
│                                                 │
│ Contract (Validated ✅):                       │
│ • Commission: 12% (Standard)                   │
│ • Campaign: 15% discount × 60 days             │
│ • Tablet: Free (Model: T-200)                  │
│ • Contract: 12 months                          │
│                                                 │
│ Business Context:                               │
│ • Current revenue: ~€350k/year                 │
│ • Competitors: UberEats, Glovo                 │
│ • Main goal: Reach new customers weekends      │
│ • Expected orders: 50-60/week                  │
│                                                 │
│ Owner Profile:                                  │
│ • Personality: Growth-oriented, price-aware    │
│ • Motivated by: Competitor delivery delays     │
│ • Main concern: Commission structure           │
│ • Decision trigger: Bolt's local market share  │
│                                                 │
│ ✅ ALL SYSTEMS CONFIGURED AUTOMATICALLY        │
│ 📞 Action: Call partner D+1 for onboarding    │
│ 📊 Monitor: TT21 target <21 days              │
└────────────────────────────────────────────────┘
```

---

## PILLAR 3: CLOSED-LOOP AUDIT & CONTINUOUS IMPROVEMENT

**Objective:** Rapid error correction + organizational learning

---

### 3.1 Daily Exception Log (Safety Net)

#### Auto-Generated Report Content

**Flagged Items:**
- Campaigns that failed to apply
- Billing mismatches (commission not configured correctly)
- Merchant profile with missing business information (competitors, goals, revenue)
- AI extraction confidence <90% not reviewed within SLA
- Tablet activations that failed
- Contract-call discrepancies not resolved

#### Process

```python
DAILY at 09:00 CET:
  → System generates exception report
  → Sends to Ops Team via Email + Slack
  → Each exception tagged with:
      - Severity (P0/P1/P2)
      - Merchant ID
      - Root cause (if known)
      - Assigned owner

Ops Team SLA:
  → P0 (revenue impact): <2h review
  → P1 (partner experience): <24h review
  → P2 (data quality): <48h review

Resolution Process:
  → Ops fixes issue manually
  → Logs root cause in incident tracker
  → Tags for AI model improvement
  → Escalates systemic issues to Engineering
```

---

### 3.2 TT21 Monitoring System

#### Metric Definition

**TT21:** Time to 21st Order (vs industry standard TT10)
- **Why 21st Order:** Stronger signal of sustained engagement
- **Target:** <21 days for 70% of SMB partners by D90
- **Baseline:** Estimated ~28 days current state

#### Monitoring Process

```python
FOR each new partner:
  Day 1-17: Monitor order accumulation (no alerts)

  Day 18:
    IF orders < 18:
      → ⚠️ ALERT to AM: "Partner at risk, only X orders by D18"
      → Suggest interventions:
          - Check menu quality (photos, descriptions)
          - Optimize delivery zone
          - Review pricing vs competitors

  Day 21:
    IF orders >= 21:
      → 🎉 SUCCESS - Mark partner as "Activated"
      → Calculate actual TT21
      → Update benchmark data
    ELSE:
      → 🚨 ESCALATE to AM
      → Trigger proactive outreach protocol
      → Log for churn prediction model
```

---

### 3.3 Feedback Loop & Model Improvement

#### SDR Performance Evaluation

**Data Sources:**
- Call transcripts (all SDRs)
- Closure rates by SDR
- Time-to-close by SDR
- Objection handling effectiveness
- AI extraction accuracy by SDR (clarity of information gathering)

**Evaluation Process:**

```python
MONTHLY:
  1. Analyze top 10% performing SDRs
     → Extract common patterns
     → Identify winning phrases
     → Document objection-handling techniques

  2. Analyze bottom 20% struggling SDRs
     → Identify common failure modes
     → Flag areas for coaching:
         - Poor discovery questions
         - Weak objection handling
         - Incomplete information gathering
         - Rushed closures (missing key data)

  3. Generate personalized training plans
     → SDR receives report with:
         - Strengths (maintain)
         - Improvement areas (focus)
         - Example calls from top performers
         - Coaching sessions scheduled

  4. Update Sales Co-Pilot RAG system
     → Feed winning patterns into AI assistant
     → Remove ineffective suggestions
     → Add new objection-handling scripts
```

#### AI Model Retraining

**Monthly Process:**
1. **Collect Corrections:** All Sales Ops manual reviews logged
2. **Identify Patterns:** Common AI failure modes analyzed
3. **Update Training Data:** Corrected examples added to model
4. **Few-Shot Learning:** Edge cases become training examples
5. **Chain-of-Thought Prompts:** Complex scenarios get reasoning templates
6. **Regression Testing:** Model tested on historical data
7. **Deploy Updated Model:** If accuracy improves >2%, deploy to production

---

### 3.4 Internal Intelligence Dashboards

#### Dashboard 1: Sales Manager Performance View

**Audience:** Sales Managers, Sales Ops

**Content:**

**Geographic Heatmap:**
- Merchant density by neighborhood
- Average deal size by area
- Competitor strength by territory
- Untapped "rich areas" (high potential, low penetration)

**SDR Performance Matrix:**
- Closure rates by SDR
- Time in each sales stage (intro → negotiation → close)
- Common failure points per SDR
- AI extraction quality score per SDR (clear info gathering = higher score)

**Pipeline Health:**
- Deals stuck in each stage
- Average time to close (by segment)
- Deal value distribution
- Predicted monthly closures (ML forecast)

**Actions Enabled:**
- Identify which SDRs need coaching on which skills
- Reallocate territories based on performance
- Focus prospecting on high-potential areas

---

#### Dashboard 2: Sales Ops Intelligence

**Audience:** Sales Ops, Pricing Team, Product Team

**Content:**

**Pricing Insights:**
- Commission negotiation patterns
- Price elasticity by cuisine type
- Competitive pricing intel (what competitors offer)
- Campaign effectiveness by discount level

**Merchant Needs Analysis:**
- Top feature requests mentioned in calls
- Common pain points by segment
- Competitor advantages cited by merchants
- Reasons for choosing Bolt (or not)

**Market Dynamics:**
- Cuisine type trends by geography
- Merchant growth aspirations
- Multi-location expansion likelihood
- Franchise opportunities

**Actions Enabled:**
- Inform pricing strategy adjustments
- Prioritize product roadmap based on merchant needs
- Identify new market opportunities
- Competitive positioning refinement

---

#### Dashboard 3: Intel Team Market View

**Audience:** Strategy & Planning (S&P), Market Intelligence

**Content:**

**Market Sizing:**
- Total merchants by cuisine type + geography
- Estimated GMV by area
- Penetration rates vs total addressable market
- Growth velocity by neighborhood

**Competitive Landscape:**
- Competitor share of voice in calls
- Merchant dual-listing patterns (selling on multiple platforms)
- Competitive advantages/disadvantages by platform
- Pricing comparison matrix

**Expansion Opportunities:**
- Underserved cuisines by area
- High-growth neighborhoods
- Enterprise pipeline (multi-location chains)
- Franchise network potential

**Actions Enabled:**
- Strategic market entry decisions
- Investment prioritization (which cities/neighborhoods)
- Competitive response strategies
- Partnership opportunity identification

---

### 3.5 Agent Co-Pilot Training & Improvement

#### Training Data Collection

**Sources:**
- Top 10% SDR call transcripts
- Successful objection-handling moments
- Effective discovery questions
- Winning closing techniques

#### Continuous Learning Loop

```python
WEEKLY:
  1. Identify new successful patterns
  2. Extract key phrases and frameworks
  3. Add to Co-Pilot RAG knowledge base
  4. Test with sample conversations
  5. Deploy to production Co-Pilot

Result:
  → Co-Pilot becomes smarter every week
  → Newer SDRs benefit from veteran knowledge
  → Institutional knowledge preserved even with turnover
```

---

## SECTION 3: PARTNER TRANSPARENCY LAYER

### 3.1 Automated Communications

#### WhatsApp/SMS Confirmation

**Trigger:** Campaign activation on Go-Live (D0)

**Message Template:**

```
🎉 Sua campanha de 15% está ativa no Bolt Food!

Pizzaria do Bairro, seu restaurante está agora disponível
para milhares de clientes em Bay Ridge.

✅ Desconto de 15% ativo por 60 dias
✅ Tablet configurado e funcionando
✅ Pedidos a caminho!

Dúvidas? Seu Account Manager liga amanhã para apoiar.

- Equipe Bolt Food
```

**Cost:** ~€0.05/message × 1,000 partners/month = **€50/month**

**Impact:** Expected 40% reduction in D7 escalations (perception vs reality mismatch)

---

#### PDF Summary Document

**Trigger:** Contract signature

**Content:**

**Page 1:** Contract summary
- Commission structure
- Campaign details
- Tablet information
- Contract duration

**Page 2:** Growth plan conversation summary
- Their stated goals
- Bolt's commitments
- Expected order volumes
- Next steps with AM

**Page 3:** Key contacts
- Assigned Account Manager (name, photo, email, phone)
- Support hotline
- Portal login credentials

**Distribution:**
- Sent to merchant email (DocuSign notification)
- Stored in Salesforce (accessible to AM)
- Shared with AM (handover material)

**Purpose:**
- Creates written record of commitments
- Merchant can reference anytime (reduces "broken promise" perception)
- AM has complete context from day 1

---

### 3.2 Ongoing Status Updates

#### Automated Milestone Messages

- **D+1:** "Bem-vindo! Seu Account Manager [Name] liga hoje para onboarding."
- **D+7:** "Primeira semana completa! Você recebeu [X] pedidos. Continue assim! 🚀"
- **D+14:** "Você está a meio caminho da meta! [X] de 21 pedidos. Quer dicas para acelerar?"
- **D+21 (if goal met):** "🎉 Parabéns! 21 pedidos em 21 dias. Seu restaurante é um sucesso na Bolt!"
- **D+21 (if goal not met):** "Queremos ajudar! Seu AM vai ligar para otimizar seu menu e zona de entrega."

---

### Why This Matters

**Eduardo Moreira Insight:** *"Merchant owners don't care about Salesforce. They want proof that the tablet works, their business is live, and the discount is generating earnings."*

**Result:** Immediate proof that Bolt delivered → Reduces trust gap → Prevents escalations before they start

---

## SECTION 4: ROLLOUT PLAN (90-Day Execution)

### Phase 1: Pilot (Days 1-30)

#### Scope
- **Geography:** Estonia (HQ proximity, cleanest Salesforce data)
- **Participants:** 5 Sales Manager "Champions" + 3 AMs
- **Segment:** SMB only (proof of concept)

#### Objectives
1. Validate AI extraction accuracy (target: >90%)
2. Identify false positives and edge cases
3. Train Champions on new hard gates
4. Collect feedback on AM Dashboard usability
5. Test Sales Co-Pilot effectiveness
6. Validate merchant profile quality

#### Daily Activities
- 15-min standups with cross-functional team
- Real-time issue logging in Slack channel
- Weekly retrospectives

#### Success Criteria
- AI extraction accuracy >90% on 100 handovers
- Zero critical bugs causing revenue impact
- AM satisfaction score >7/10
- SDR adoption rate >80%
- Sales Co-Pilot useful in >60% of calls

#### Key Learnings Phase
- **Week 2:** First AI model iteration based on corrections
- **Week 3:** A/B test (automated vs manual handover control group)
- **Week 4:** **Go/No-Go decision** for regional expansion

---

### Phase 2: Regional Expansion (Days 31-60)

#### Scope
- **Geography:** 3 additional "Complexity Cluster A" countries (Poland, Lithuania)
- **Participants:** 20 SMs + 10 AMs across 4 countries
- **Segments:** SMB + Mid-Market (Enterprise delayed to Phase 3)

#### Incentive Activation

**SM Commission Structure Change:**
- **Previous:** 100% weight on deal size
- **New:**
  - 80% weight on deal size
  - 20% weight on "Clean Handover Score"

**Clean Handover Score Calculation:**

```
Score = (Field Completion × 40%) +
        (AI Confidence × 30%) +
        (No Post-Go-Live Issues × 30%)

If Score >= 90%: Full 20% bonus
If Score 70-89%: Partial bonus (prorated)
If Score <70%: Zero handover bonus

Grace Period: First 2 weeks (warnings only)
Week 3+: Score impacts commission immediately
```

#### Training Program
- **Weekly "Office Hours"** for SMs/AMs (30 min sessions)
- **Champions Showcase:** Top performers share tips
- **Recorded Tutorials:** Available on-demand in LMS
- **Sales Co-Pilot Training:** How to use AI assistant effectively

#### Monitoring
- Daily exception log review (Ops Team)
- Weekly metrics dashboard review (Leadership)
- Bi-weekly retrospectives (capture learnings)

---

### Phase 3: Full-Scale Rollout (Days 61-90)

#### Scope
- **Geography:** All 16 countries (phased by Complexity Cluster)
- **Participants:** Full Sales + AM teams
- **Segments:** SMB, MM, and Enterprise

#### Rollout Strategy: "Complexity Clusters" (Not Geographic)

**Why NOT rollout by region?**
16 countries have vastly different Salesforce data quality. Regional rollout risks catastrophic failure in dirty-data markets.

**Instead: Rollout by Data Maturity**

**Tier 1 (Clean Data) - Weeks 9-10:**
- Estonia ✅ (already live from pilot)
- Poland, Lithuania
- **Criteria:** Salesforce usage mature, historical data clean, SM adoption high

**Tier 2 (Moderate) - Weeks 11-12:**
- Latvia, Romania, Croatia
- **Preparation:** 1-week data cleanup sprint before rollout
- **Support:** Increased Ops coverage for first week

**Tier 3 (Requires Cleanup) - Month 4:**
- Remaining markets with legacy data issues
- **Preparation:** 2-week data hygiene program
- **Approach:** Temporary hybrid model (AI + manual) until data clean

#### Hard Gate Enforcement
- **Grace period ended:** All handovers require validation
- **Manual handovers:** Become exceptions requiring VP approval
- **Commission impact:** Fully active for all markets

#### Monitoring Intensity
- **Daily:** Exception log review + P0 incident response
- **Weekly:** Metrics dashboard review with Executive Sponsor
- **Bi-weekly:** Cross-country retrospectives (share learnings)

---

### Adoption Strategy: "Invisible Compliance"

#### For Sales Managers

**1. AI Does the Work**
- SM speaks naturally (existing behavior)
- AI writes structured data (new capability)
- SM only **reviews**, not **creates**
- **Result:** Zero extra work, better data quality

**2. Hard Gates Protect SM**
- Can't generate contract without validated data
- Prevents embarrassing errors with merchants
- **Result:** SM wins (protected from mistakes)

**3. Faster Commission**
- Clean handover → Partner goes live faster
- Faster Go-Live → SM hits quota sooner
- Quota hit → Commission paid faster
- **Result:** Financial incentive aligned with quality

**4. Visible Consequences**
- After grace period, "Dirty Handover Score" impacts bonus
- Not punitive - **transparent**
- SM can see their score in real-time dashboard
- **Result:** Clear feedback loop for improvement

#### For Account Managers

**1. Time Savings**
- 30-40% reduction in "CRM archaeology"
- More time for growth activities (upselling, optimization)
- **Result:** AM can manage more partners, add more value

**2. Better First Impressions**
- Partner receives immediate SMS confirmation
- Fewer angry calls about "broken promises"
- **Result:** Relationship starts positive, not defensive

**3. Proactive Tools**
- TT21 alerts enable intervention **before** churn
- Merchant profile provides context for personalized approach
- **Result:** AM looks like a hero, not a firefighter

#### For Partners (Merchants)

**1. Instant Transparency**
- WhatsApp confirmation that promised campaign is live
- PDF summary of commitments for their records
- **Result:** Trust established from day 1

**2. Faster Activation**
- SMB partners go live in <24h (vs 4.5 days current)
- Start earning revenue immediately
- **Result:** Positive ROI on Bolt partnership from day 1

---

### Champions Program

#### Selection Criteria
- Top 10% performing SMs by closure rate
- High Salesforce data quality track record
- Respected by peers (peer-nominated)
- Willing to provide feedback and coaching

#### Program Structure
- **Early Access:** Champions get new features 1 week before general release
- **Feedback Sessions:** Weekly 1-on-1 with Product team
- **Public Recognition:** Featured in company-wide calls, internal newsletter
- **Influence:** Their feedback shapes final product design
- **Network:** Champions community (cross-country Slack channel)

#### Expected Outcome
- **Ownership, not imposed change**
- Champions become evangelists in their markets
- Peer-to-peer learning accelerates adoption
- Reduces change management resistance

---

## SECTION 5: SUCCESS METRICS & MONITORING

### 5.1 North Star Metric

**Primary KPI:** % of partners achieving **21 orders in <21 days (TT21)**

**Why TT21 (not TT10)?**
- **Stronger Signal:** 21 orders = sustained engagement, not just initial curiosity
- **Leading Indicator:** Correlates more strongly with D90 retention
- **Industry Validated:** Food delivery data shows TT21 is inflection point
- **Aligns Incentives:** Sales wants fast activation, AM wants happy partners

**Baseline Assumption:** Current median TT21 ~28 days (industry benchmark)

**Target Progression:**
- **D30:** 50% of partners achieve TT21 <21 days
- **D60:** 60% of partners achieve TT21 <21 days
- **D90:** 70% of partners achieve TT21 <21 days

---

### 5.2 Supporting Metrics (MECE Framework)

#### Leading Indicators (Process Quality)

| Metric | Current | D30 Target | D60 Target | D90 Target | Owner |
|--------|---------|------------|------------|------------|-------|
| % handovers with 100% complete info | 62% | 80% | 90% | 95% | Sales Ops |
| % handovers with complete merchant profile | 0% | 70% | 85% | 90% | Sales Ops |
| % campaigns applied <24h of Go-Live | 67% | 85% | 92% | 95% | Campaign Ops |
| AI extraction confidence score (avg) | N/A | >85% | >90% | >92% | Sales Ops |
| % handovers zero-touch (no human review) | 0% | 60% | 75% | 85% | Sales Ops |
| Sales Co-Pilot usage rate | N/A | 50% | 70% | 80% | Sales Managers |
| SDR avg Clean Handover Score | N/A | 75 | 82 | 88 | Sales Leadership |

#### Process Efficiency Metrics

| Metric | Current | D30 Target | D60 Target | D90 Target | Owner |
|--------|---------|------------|------------|------------|-------|
| Avg time from contract → Go-Live (SMB) | 4.5 days | 3.0 days | 2.0 days | <1.5 days | Ops Team |
| Avg time AM spends on CRM archaeology | ~40% | 30% | 20% | <15% | AM Team |
| Daily exception log volume | N/A | <50 | <30 | <20 | Ops Team |
| Exception resolution time (avg) | N/A | <12h | <8h | <4h | Ops Team |

#### Lagging Indicators (Business Outcomes)

| Metric | Current | D30 Target | D60 Target | D90 Target | Owner |
|--------|---------|------------|------------|------------|-------|
| Partner escalations "broken promises" | 28% (SMB) | 22% | 18% | <15% | AM Team |
| D30 churn rate (SMB) | ~15% est. | 13% | 11% | <10% | AM Team |
| % partners with TT21 <21 days | ~40% est. | 50% | 60% | 70% | AM Team |
| AM satisfaction score (NPS) | N/A | 40 | 50 | 60+ | AM Leadership |
| SM satisfaction score (NPS) | N/A | 30 | 45 | 55+ | Sales Leadership |

---

### 5.3 Automated Safety Net (Antifragility Principle)

**Philosophy:** Automation is not "set and forget"—it's "automate and monitor."

#### Daily Exception Log Components

**Auto-Generated Report (Sent 09:00 CET Daily):**

1. **Campaign Application Failures**
   - Expected: <1% failure rate
   - Action: Flagged for immediate Ops review

2. **Billing Mismatches**
   - AI extraction confidence <90% not reviewed in SLA
   - Commission not applied correctly
   - Action: Finance Ops review + correction

3. **Missing Merchant Profile Data**
   - Competitors field empty
   - Goals/motivations not captured
   - Revenue estimate missing
   - Action: Sales Ops contacts SM for completion

4. **Missing Mandatory Fields**
   - Detected post-contract signature
   - Should be zero if Hard Gates working
   - Action: Immediate investigation (gate bypass?)

5. **API Failures**
   - Tablet activation failed
   - Campaign Tool API timeout
   - Billing API error
   - Action: Engineering investigation + manual fallback

6. **Contract-Call Discrepancies**
   - Flagged by AI Contract Auditor
   - Not resolved within 48h
   - Action: Sales Ops expedite review

#### Review SLA

| Priority | Impact | Review SLA | Resolution SLA |
|----------|--------|------------|----------------|
| **P0** | Revenue impact, partner can't go live | <2h | <4h |
| **P1** | Partner experience degraded | <8h | <24h |
| **P2** | Data quality issue, no immediate impact | <24h | <48h |

#### Continuous Improvement Loop

```python
MONTHLY:
  1. Analyze exception log patterns
     → Identify systemic issues (not just random errors)

  2. Root cause analysis
     → WHY did this fail repeatedly?
     → Is it: Process gap? Training issue? Tech bug?

  3. Implement fixes
     → AI model retraining (if extraction error pattern)
     → Process refinement (if workflow issue)
     → Additional training (if SDR behavior issue)
     → Engineering fix (if technical bug)

  4. Measure improvement
     → Track exception volume reduction
     → Validate fixes are effective

Result: System becomes ANTIFRAGILE
→ Errors make it stronger, not weaker
→ Learns and improves from failures
→ Each failure documented and prevented in future
```

---

### 5.4 Contingency Plan (D60 Decision Gate)

**Trigger:** If D60 results show <50% of target improvement

**Example:**
- Churn reduction: Only 28% → 21% (target was 28% → 15%)
- TT21 improvement: Only 45% of partners (target was 60%)

#### Root Cause Analysis Protocol

**Step 1: Data Collection**
- Sample 50 churned partners from automated handover cohort
- Interview 10 AMs to identify process gaps
- Compare automated vs manual handover cohorts (pilot control group)
- Analyze exception log for patterns

**Step 2: Hypothesis Testing**

**Hypothesis A: Handover Quality Issue**
- **Evidence:** Escalations still high, missing info detected post-Go-Live
- **Conclusion:** Automation isn't capturing everything
- **Action:**
  - Double down on AI model retraining
  - Expand manual review coverage temporarily
  - Add additional validation checks

**Hypothesis B: Product-Market Fit Issue**
- **Evidence:** Handover clean BUT partners still churn due to low order volume
- **Root Cause:** Poor restaurant performance, not handover quality
- **Action:**
  - Pivot to manual white-glove onboarding for at-risk segments
  - Address core PMF issues (delivery times, market density, pricing)
  - Temporary measure while fixing broader problems

**Step 3: Decision Authority**
- **Meeting:** Project Lead + Executive Sponsor + Sales Leadership + AM Leadership
- **Decision Options:**
  - **GO:** Continue full-scale rollout (confident in fixes)
  - **ITERATE:** Pause new rollouts, fix issues, re-pilot in 1 market
  - **NO-GO:** Pivot to alternative approach (different automation strategy)

---

## SECTION 6: INVESTMENT & ROI

### 6.1 Cost Breakdown

#### Setup Costs (One-Time Investment)

| Component | Cost Range | Mid-Point | Notes |
|-----------|------------|-----------|-------|
| **Gong/Chorus → Salesforce Integration** | €15-25k | €20k | API development + testing |
| **AI Model Configuration** | €10-20k | €15k | Extraction + Contract Auditor + Merchant Profile Gen |
| **Sales Co-Pilot Development** | €15-25k | €20k | RAG system + real-time inference + UI |
| **API Triggers Development** | €20-35k | €27.5k | Billing, Campaign tools, Tablet system |
| **Dashboard Development** | €10-15k | €12.5k | SM Performance, Sales Ops Intel, Market View |
| **Training Materials + Documentation** | €5-8k | €6.5k | Videos, guides, internal wiki |
| **Pilot Program Execution** | €10-12k | €11k | Dedicated PM time + travel to Estonia |
| **TOTAL SETUP** | **€85-140k** | **€112.5k** | **Conservative estimate: €100k** |

#### Ongoing Costs (Monthly)

| Component | Monthly Cost | Annual Cost | Notes |
|-----------|--------------|-------------|-------|
| **AI API Calls** | €3,000 | €36k | Transcription (€2.50/call × 1000 calls) + Extraction + Merchant Profile Gen |
| **WhatsApp Business API** | €50 | €600 | 1000 messages/month × €0.05 |
| **Sales Co-Pilot Inference** | €1,500 | €18k | Real-time AI during calls |
| **Maintenance & Monitoring** | €1,500 | €18k | Engineering support (10% FTE) |
| **Model Retraining** | €500 | €6k | Quarterly retraining (amortized monthly) |
| **BPO External Agent (RLHF)** | €1,000 | €12k | Human evaluators for model improvement |
| **TOTAL ONGOING** | **€7,550/month** | **€90.6k/year** | **Round to €8k/month** |

---

### 6.2 ROI Calculation (Conservative Scenario)

#### Current State (Annual Loss)
- **Operational inefficiency:** €403k/year
- **Churn revenue lost:** €1,008k/year
- **Total Problem Cost:** €1,411k/year

#### Projected Improvement (Conservative 30% Problem Resolution)

**Operational Savings:**
- Reduce inefficiency by 70% → Save €282k/year
- (280 escalations/month reduced to 84 escalations/month)

**Churn Prevention:**
- Reduce churn by 30% (from 28% to 19.6% → 8.4 percentage points)
- Partners saved: 28 partners/month × 30% = 8.4 partners/month
- Revenue retained: 8.4 partners × €3,000 LTV × 12 months = **€302k/year**

**Total Annual Benefit:** €282k + €302k = **€584k/year**

#### Investment Required
- **Setup:** €100k (one-time)
- **Ongoing:** €96k/year (€8k × 12 months)
- **Total Year 1 Cost:** €196k

#### Payback Calculation
- **Year 1 Net Benefit:** €584k - €96k = €488k
- **Payback Period:** €100k ÷ (€584k/12) = **2.05 months**
- **Conservative Payback:** **3-4 months** (accounting for ramp-up)

#### 3-Year NPV (10% Discount Rate)

| Year | Benefit | Ongoing Cost | Net Benefit | Discounted Value |
|------|---------|--------------|-------------|------------------|
| **0** | €0 | -€100k (setup) | -€100k | -€100k |
| **1** | €584k | -€96k | €488k | €444k |
| **2** | €584k | -€96k | €488k | €403k |
| **3** | €584k | -€96k | €488k | €366k |
| **NPV** | | | | **€1,113k** |

**ROI:** (€1,113k - €100k) / €100k = **1,013%** over 3 years

---

### 6.3 Sensitivity Analysis

**Scenario Planning:**

| Scenario | Problem Resolution | Annual Benefit | Payback Period | 3-Year NPV |
|----------|-------------------|----------------|----------------|------------|
| **Pessimistic** | 20% | €389k | 4 months | €782k |
| **Conservative** | 30% | €584k | 3 months | €1,113k |
| **Realistic** | 50% | €973k | 2 months | €2,032k |
| **Optimistic** | 70% | €1,362k | 1 month | €3,252k |

**Conclusion:** Even in pessimistic scenario (20% improvement), payback is <4 months with strong positive NPV.

---

### 6.4 Beyond Direct ROI: Strategic Benefits

**1. Organizational Learning**
- **Current:** Zero structured knowledge capture
- **Future:** Every call becomes training data
- **Value:** Continuous SDR improvement, faster onboarding of new hires, preserved institutional knowledge

**2. Market Intelligence**
- **Current:** No systematic market insights
- **Future:** Real-time competitive intelligence, pricing trends, expansion opportunities
- **Value:** Better strategic decisions, faster response to market changes

**3. Scalability**
- **Current:** Human bottleneck limits growth
- **Future:** Can scale to 2x, 5x, 10x handovers without proportional headcount
- **Value:** Supports Bolt's aggressive expansion plans

**4. Partner Experience**
- **Current:** Broken promises, slow activation, frustrated merchants
- **Future:** Instant transparency, fast Go-Live, proactive support
- **Value:** Higher merchant satisfaction → Better retention → More referrals

**5. Competitive Advantage**
- **Current:** Industry-standard manual processes
- **Future:** AI-powered, data-driven, continuously improving system
- **Value:** Differentiation in crowded food delivery market

---

## SECTION 7: RISK MITIGATION

### 7.1 Comprehensive Risk Register

| Risk | Probability | Impact | Mitigation (Proactive) | Fallback (Reactive) | Owner |
|------|-------------|--------|------------------------|---------------------|-------|
| **AI Extraction Errors** | Medium | Medium | • Confidence threshold >90% for auto-apply<br>• Human review queue for edge cases<br>• Monthly model retraining | • Manual review queue (2h SLA)<br>• SM validation required (Hard Gate #1) | Sales Ops |
| **Sales Co-Pilot Hallucinations** | Low | Medium | • RAG system grounded in verified data<br>• No auto-suggestions for complex negotiations<br>• Human SDR always in control | • SDR can ignore suggestions<br>• Flag bad suggestions for model improvement | Sales Ops |
| **API Failures (Billing)** | Low | High | • Retry logic with exponential backoff<br>• Real-time alerting to Engineering<br>• Health checks every 5 min | • Manual application by Campaign Ops<br>• SLA: <4h for critical fixes<br>• Emergency rollback procedure | Engineering + Ops |
| **SM Resistance to Adoption** | High | High | • Commission tied to clean handover (20%)<br>• Hard gates make compliance easiest path<br>• Champions program for evangelists | • Grace period 2 weeks (warnings only)<br>• After grace: incomplete handovers returned<br>• Coaching for persistent resisters | Sales Leadership |
| **Partner Confusion (Missing Comms)** | Medium | Medium | • Automated SMS/WhatsApp confirmation<br>• PDF summary document<br>• AM dashboard shows real-time status | • AM outbound call (D+1) if no order received<br>• Emergency hotline for partners | AM Team |
| **Data Quality in Legacy Markets** | High | High | • Rollout by "Complexity Clusters" (clean first)<br>• Pre-rollout data cleanup sprints<br>• Defer Tier 3 markets to Month 4 | • Manual data cleanup before rollout<br>• Temporary hybrid (AI + manual) for dirty markets | Ops |
| **AI "Hallucinations" on Complex Deals** | Low | Medium | • Enterprise: AI suggests, human validates always<br>• Contract-Call Auditor flags discrepancies<br>• Sales Ops reviews all flagged cases | • Post-signature correction protocol<br>• Partner notified of any changes<br>• Incident review to improve model | Sales Ops |
| **System Downtime During Go-Live** | Low | High | • Pre-Go-Live health checks<br>• Redundant API endpoints<br>• Staged rollout (not all partners same day) | • Manual activation protocol (documented)<br>• 24/7 on-call Engineering during rollout<br>• Partner communication about delays | Engineering |
| **Merchant Profile Data Privacy** | Low | Critical | • GDPR compliance by design<br>• Encrypted storage<br>• Access controls (role-based)<br>• Audit logs for all access | • Data breach response plan<br>• Legal team notification<br>• Partner notification (if required) | Legal + Security |
| **Sales Co-Pilot Dependency** | Medium | Low | • Co-Pilot is assistant, not requirement<br>• SDRs can still close without it<br>• Downtime < 1% of calls | • System works without Co-Pilot<br>• Manual closing process still available | Sales Ops |
| **Over-Reliance on Automation (Skill Atrophy)** | Medium | Medium | • Regular training on manual processes<br>• Quarterly "manual mode" drills<br>• New hire training includes both modes | • Can revert to manual process if needed<br>• Knowledge documented in wiki | Sales Leadership |

---

### 7.2 Monitoring & Early Warning System

#### Real-Time Alerts (Slack + Email)

**Trigger Conditions:**
- API failure rate >5% in any 1-hour window
- AI extraction confidence drops below 85% average (daily)
- Campaign application failure rate >2% (daily)
- Partner escalation spike >15% above baseline (weekly)
- Sales Co-Pilot usage drops below 40% (sign of tool issues)
- Exception log volume >50 items/day (system stress indicator)

**Alert Routing:**
- P0 (Revenue Impact) → Engineering on-call + Ops Lead + Executive Sponsor
- P1 (Partner Experience) → Ops Team + AM Leadership
- P2 (Data Quality) → Sales Ops + Project Lead

---

#### Weekly Health Dashboard

**Key Metrics Tracked:**
- Handover completion rate by segment (SMB/MM/Enterprise)
- AI accuracy trends (with sample review of corrections)
- Exception log volume + resolution time distribution
- SM/AM adoption rates by country
- Sales Co-Pilot usage + effectiveness ratings
- Merchant profile completeness score

**Dashboard Access:**
- Project Lead: Full access (all metrics)
- Executive Sponsor: Executive summary view
- Sales Ops: Deep dive into AI/data quality
- Engineering: Technical health metrics
- AM Leadership: Partner experience metrics

---

#### Monthly Business Review

**Agenda:**

1. **North Star Metric (TT21) Trend Analysis**
   - Current performance vs targets
   - Cohort analysis (automated vs manual handovers)
   - Forecast for next month

2. **Churn Deep Dive**
   - Churned partner analysis (automated handover cohort)
   - Root causes identified
   - Corrective actions planned

3. **ROI Realization Tracking**
   - Actual cost savings vs forecast
   - Actual churn reduction vs forecast
   - Payback timeline update

4. **Feedback Themes**
   - Top 5 issues from SMs
   - Top 5 issues from AMs
   - Top 5 issues from Partners
   - Action plans for each

5. **Roadmap Review**
   - Completed initiatives
   - In-flight projects
   - Next quarter priorities

---

## SECTION 8: KEY DESIGN PRINCIPLES

### 8.1 Human-in-the-Loop AI (Not Full Autonomy)

**Principle:** AI augments human decision-making; never replaces it in high-stakes scenarios.

**Application:**

- **SMB:** AI can operate autonomously for standardized deals
- **Mid-Market:** AI proposes, humans validate before execution
- **Enterprise:** AI only assists; humans drive all decisions

**Why This Matters:**
- Prevents catastrophic errors from AI hallucinations
- Maintains trust with merchants (human accountability)
- Enables continuous learning (humans catch edge cases)

---

### 8.2 Hard Gates (Forcing Functions for Quality)

**Principle:** Make the right thing the easiest thing; make the wrong thing impossible.

**Application:**

- **Hard Gate #1:** Cannot generate contract without validated merchant profile
- **Hard Gate #2:** Cannot proceed to Go-Live without complete handover data
- **Commission Structure:** Clean handover = higher pay

**Why This Matters:**
- Aligns incentives (quality = speed = money)
- Eliminates workarounds (hard constraints, not suggestions)
- Creates systemic accountability

---

### 8.3 Antifragility (Getting Stronger from Errors)

**Principle:** Systems should improve from failures, not just survive them.

**Application:**

- **Daily Exception Log:** Every error captured and analyzed
- **Monthly Model Retraining:** Errors become training data
- **RLHF Process:** Human reviewers teach AI from mistakes
- **Root Cause Analysis:** Patterns identified and fixed systemically

**Why This Matters:**
- System becomes more accurate over time
- Institutional knowledge preserved in AI models
- Rare edge cases don't recur

---

### 8.4 Segment-Specific Automation (No One-Size-Fits-All)

**Principle:** Different segments require different automation levels.

**Application:**

| Segment | Automation % | Rationale |
|---------|-------------|-----------|
| **SMB** | 95% | High volume, standardized deals, low complexity |
| **Mid-Market** | 60-75% | Moderate complexity, requires validation |
| **Enterprise** | 20% | High complexity, strategic relationships, white-glove required |

**Why This Matters:**
- Maximizes ROI (automate where it makes sense)
- Preserves relationships (white-glove where needed)
- Scales effectively (SMB automation frees capacity for Enterprise)

---

### 8.5 Partner Transparency (Trust Through Proof)

**Principle:** Merchants trust actions, not promises.

**Application:**

- **Immediate SMS/WhatsApp:** Campaign is live (proof)
- **PDF Summary:** Written record of commitments
- **Milestone Messages:** Regular updates on progress

**Why This Matters:**
- Reduces "broken promise" escalations
- Builds trust from day 1
- Proactive communication prevents reactive support

---

### 8.6 Organizational Learning (Knowledge as Competitive Advantage)

**Principle:** Every interaction is training data for the organization.

**Application:**

- **SDR Performance Analytics:** Identify top performers, replicate patterns
- **Market Intelligence Dashboards:** Competitive insights, pricing trends
- **Continuous Model Improvement:** AI learns from every correction

**Why This Matters:**
- Faster onboarding of new SDRs (learn from veterans)
- Better strategic decisions (data-driven market insights)
- Sustainable competitive advantage (continuously improving system)

---

## IMPLEMENTATION CHECKLIST

### Pre-Implementation (Weeks -2 to 0)

- [ ] Secure executive sponsorship + budget approval
- [ ] Form cross-functional team (Sales Ops, Engineering, AM Leadership)
- [ ] Select pilot market (Estonia) + Champions (5 SMs, 3 AMs)
- [ ] Set up project tracking (Jira/Asana)
- [ ] Create Slack channel for real-time collaboration
- [ ] Kick-off meeting with all stakeholders

### Phase 1: Pilot Setup (Weeks 1-4)

**Week 1: Foundation**
- [ ] Configure Gong/Chorus → Salesforce integration
- [ ] Set up AI extraction model (initial configuration)
- [ ] Build Sales Co-Pilot MVP (basic RAG system)
- [ ] Create Hard Gate #1 validation logic
- [ ] Design handover dossier template

**Week 2: Testing & Refinement**
- [ ] Test AI extraction on historical calls (50 samples)
- [ ] Validate accuracy >85% baseline
- [ ] Train Champions on new process
- [ ] Conduct dry-run handovers (5 test cases)
- [ ] Iterate based on feedback

**Week 3: Live Pilot**
- [ ] Go live with 5 Champions (Estonia SMB only)
- [ ] Daily standups (15 min)
- [ ] Real-time issue logging in Slack
- [ ] Monitor exception log daily
- [ ] Collect qualitative feedback

**Week 4: Analysis & Decision**
- [ ] Analyze 100+ handovers from pilot
- [ ] Calculate AI extraction accuracy
- [ ] Measure AM time savings
- [ ] Conduct retrospective with Champions
- [ ] **Go/No-Go decision** for Phase 2

### Phase 2: Regional Expansion (Weeks 5-8)

**Week 5: Preparation**
- [ ] Retrain AI model based on pilot learnings
- [ ] Expand to Poland, Lithuania
- [ ] Activate SM commission structure (20% Clean Handover Score)
- [ ] Launch Champions program (10 additional SMs)
- [ ] Create training materials (videos, guides)

**Weeks 6-8: Scaled Rollout**
- [ ] Onboard 20 SMs + 10 AMs across 4 countries
- [ ] Weekly "Office Hours" sessions
- [ ] Monitor daily exception log
- [ ] Weekly metrics dashboard review
- [ ] Bi-weekly retrospectives

### Phase 3: Full-Scale Rollout (Weeks 9-12)

**Week 9-10: Tier 1 Markets**
- [ ] Rollout to all Tier 1 markets (clean Salesforce data)
- [ ] Hard gate enforcement (no more grace period)
- [ ] 24/7 on-call Engineering support

**Week 11-12: Tier 2 Markets**
- [ ] Pre-rollout data cleanup sprint
- [ ] Rollout to Tier 2 markets
- [ ] Increased Ops coverage for first week

**Week 13+: Tier 3 Markets**
- [ ] 2-week data hygiene program
- [ ] Temporary hybrid model (AI + manual)
- [ ] Full rollout to remaining markets

### Post-Launch (Ongoing)

**Daily:**
- [ ] Review exception log (09:00 CET)
- [ ] P0 incident response (<2h SLA)

**Weekly:**
- [ ] Metrics dashboard review
- [ ] Champions showcase (best practices sharing)

**Monthly:**
- [ ] AI model retraining
- [ ] Business review meeting
- [ ] SDR performance evaluation
- [ ] Roadmap review

---

## APPENDIX

### A. Glossary of Terms

- **TT21:** Time to 21st Order (North Star Metric)
- **SMB:** Small/Medium Business (single location, standardized deals)
- **MM:** Mid-Market (2-10 locations, moderate complexity)
- **Enterprise:** Large merchants (10+ locations, complex agreements)
- **Hard Gate:** Blocking validation that prevents proceeding without complete data
- **Clean Handover Score:** Composite metric (Field Completion + AI Confidence + No Issues)
- **RAG:** Retrieval-Augmented Generation (AI technique using knowledge base)
- **RLHF:** Reinforcement Learning from Human Feedback
- **D0, D+1, D+7:** Day 0 (Go-Live), Day 1, Day 7 after activation

---

### B. API Integration Requirements

**Required Integrations:**

1. **Gong/Chorus ↔ Salesforce**
   - Trigger: Call recording completion
   - Data: Transcription text, speaker labels, timestamps
   - Frequency: Real-time (webhook-driven)

2. **Salesforce ↔ Billing System**
   - Trigger: Contract signature
   - Data: Merchant ID, commission %, effective date
   - Frequency: Event-driven

3. **Salesforce ↔ Campaign Management Tool**
   - Trigger: Contract signature
   - Data: Campaign type, discount %, duration, start date
   - Frequency: Event-driven

4. **Salesforce ↔ Tablet Management System**
   - Trigger: Contract signature
   - Data: Merchant ID, tablet model, activation date
   - Frequency: Event-driven

5. **Salesforce ↔ WhatsApp Business API**
   - Trigger: Campaign activation (D0)
   - Data: Merchant phone, message template, parameters
   - Frequency: Scheduled (D0 activation time)

---

### C. Data Schema: Merchant Profile JSON

See Component 1.5 for complete schema example.

---

### D. Success Metrics Dashboard Mockup

[Note: This would include visual mockups of the three dashboards - Sales Manager Performance View, Sales Ops Intelligence, and Intel Team Market View]

---

### E. Training Materials Outline

**For Sales Managers:**
1. "Why This Matters" (5 min video)
2. "How AI Extraction Works" (10 min demo)
3. "Hard Gates Explained" (5 min)
4. "Clean Handover Score" (8 min)
5. "Sales Co-Pilot Quick Start" (12 min)

**For Account Managers:**
1. "What Changes for You" (7 min video)
2. "Reading Handover Dossiers" (10 min)
3. "TT21 Monitoring Dashboard" (8 min)
4. "Merchant Profile Deep Dive" (12 min)

**For Sales Ops:**
1. "Daily Exception Log Review" (15 min)
2. "Manual Review Queue Process" (10 min)
3. "AI Model Feedback Loop" (12 min)
4. "RLHF Best Practices" (20 min)

---

### F. Contact & Escalation Matrix

| Issue Type | First Contact | Escalation (if unresolved) | SLA |
|------------|---------------|---------------------------|-----|
| **AI Extraction Error** | Sales Ops | Engineering Lead | P1: 8h |
| **API Failure** | Engineering On-Call | CTO | P0: 2h |
| **Partner Escalation** | Assigned AM | AM Team Lead | P1: 4h |
| **SM Adoption Issue** | Sales Manager | Regional Sales Director | P2: 24h |
| **Data Privacy Concern** | Legal Team | DPO + Executive Sponsor | P0: 1h |

---

## DOCUMENT VERSION CONTROL

- **Version:** 1.0
- **Date:** 2026-02-12
- **Author:** Leo (Candidate)
- **Status:** Final Specification
- **Next Review:** Post-Pilot (Week 4)

---

**END OF SPECIFICATION**
