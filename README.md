# Bolt Merchant Validation System

**Pre-Contract Validation System (Hard Gate #1)** - Production-ready TypeScript application for automating merchant onboarding validation.

## 🚀 Features

- **Hard Gate #1 Validation (DT-001)**: Automated validation of AI-extracted merchant data
- **Mandatory Fields Checking**: Ensures all required fields are populated
- **AI Confidence Threshold**: 90% confidence threshold with automatic routing
- **Sales Ops Routing**: Low-confidence cases automatically routed to Sales Ops (2h SLA)
- **Sales Manager Override**: Authorized override workflow with justification
- **Validation Reports**: Daily reports and analytics
- **Multi-language Support**: English, Spanish, Estonian with language selector on all pages
- **Real-time Notifications**: Slack and Email notifications for all validation events

## 🏗️ Technology Stack

### Backend
- **Express 4** - Web server
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM for MySQL
- **MySQL/TiDB** - Database
- **Zod** - Schema validation
- **Winston** - Logging
- **Nodemailer** - Email notifications
- **Slack Web API** - Slack notifications

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **react-i18next** - Internationalization
- **TanStack React Query** - Data fetching
- **Vite** - Build tool

### AI Integration
- **Manus API** - AI/LLM provider (Claude/GPT-4)

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Bolt_Merchant_Automation
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Run database migrations**
```bash
pnpm db:generate
pnpm db:migrate
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
pnpm dev
```

Terminal 2 (Frontend):
```bash
pnpm dev:client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **tRPC endpoint**: http://localhost:3000/trpc

## 🔧 Configuration

### Environment Variables

See `.env.example` for all configuration options. Key variables:

- **DATABASE_URL**: MySQL connection string
- **MANUS_API_KEY**: Manus AI API key
- **SLACK_API_TOKEN**: Slack Bot token
- **SMTP_***: Email configuration
- **CONFIDENCE_THRESHOLD**: AI confidence threshold (default: 90)
- **SALES_OPS_SLA_HOURS**: SLA for Sales Ops review (default: 2)

### Validation Rules

Validation rules are configured in `src/server/utils/validationRules.ts`:

- Mandatory fields list
- Confidence threshold
- Override authorization rules
- SLA configurations

## 🎯 Usage

### Execute Validation

```typescript
// Via tRPC
const result = await trpc.validation.executeHardGate.mutate({
  extractionId: 'extraction-uuid',
});
```

### Override Validation

```typescript
// Sales Manager only
const result = await trpc.validation.requestOverride.mutate({
  validationId: 'validation-uuid',
  justification: 'Detailed justification (min 50 chars)...',
});
```

### Get Reports

```typescript
// Daily report
const report = await trpc.reports.getDailyReport.query({
  date: '2026-02-12',
});

// Period statistics
const stats = await trpc.reports.getValidationStats.query({
  days: 30,
});
```

## 🌐 Internationalization

The application supports three languages:
- **English (en)** - Default
- **Spanish (es)** - Español
- **Estonian (et)** - Eesti

### Adding New Languages

1. Create translation files in `src/client/i18n/locales/[lang-code]/`
2. Add language to `src/client/i18n/config.ts`
3. Update `LanguageSelector.tsx` with new language option

### Translation Structure

```
src/client/i18n/locales/
├── en/
│   ├── common.json      # Common UI elements
│   ├── validation.json  # Validation-specific
│   └── reports.json     # Reports-specific
├── es/
└── et/
```

## 📊 Decision Tree Logic (DT-001)

The validation follows this decision tree:

```
1. Check Mandatory Fields
   ├─ Missing → FAIL (BLOCK)
   └─ All Present → Continue

2. Check AI Confidence ≥90%
   ├─ Below Threshold → MANUAL_REVIEW (Route to Sales Ops)
   └─ Above Threshold → PASS (Proceed to Contract)

3. Override Path (Optional)
   └─ Sales Manager can override with justification
```

## 🔔 Notifications

### Slack Notifications
- **Blocked Validation**: #sales-manager channel
- **Manual Review**: #sales-ops channel (2h SLA)
- **Validation Passed**: #sales-ops channel
- **Override**: #sales-ops channel

### Email Notifications
- Sales Manager: Validation failures
- Sales Ops: Manual review queue
- Stakeholders: Daily reports (09:00 CET)

## 📈 Monitoring & Logging

### Health Check
```bash
curl http://localhost:3000/health
```

### Logs
- Application logs: Winston logger
- Exception logs: Stored in `exception_log` table
- Validation logs: Complete audit trail in `validation_log` table

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Type checking
pnpm type-check
```

## 🚢 Deployment

### Build for Production

```bash
# Build backend
pnpm build:server

# Build frontend
pnpm build

# Start production server
pnpm start
```

### Database Migrations

```bash
# Generate migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## 📁 Project Structure

```
Bolt_Merchant_Automation/
├── src/
│   ├── server/              # Backend code
│   │   ├── db/              # Database schemas
│   │   ├── services/        # Business logic
│   │   ├── trpc/            # tRPC routers
│   │   ├── utils/           # Utilities
│   │   └── types/           # TypeScript types
│   └── client/              # Frontend code
│       ├── components/      # React components
│       ├── i18n/            # Translations
│       ├── utils/           # Client utilities
│       └── App.tsx          # Main app
├── migrations/              # Database migrations
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add translations for all new UI text
3. Write tests for new features
4. Update documentation
5. Follow commit message conventions

## 📝 License

Proprietary - Bolt Technology OÜ

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ by the Bolt Merchant Automation Team**
