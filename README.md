# Healthcare Scale Platform

A comprehensive Ruby on Rails API application for managing healthcare assessment scales, surveys, responses, and statistical analyses. This platform enables researchers, administrators, and students to create, distribute, and analyze healthcare assessment scales with a credit-based system.

## 🎯 Overview

The Healthcare Scale Platform is designed to facilitate the creation and management of healthcare assessment tools. Users can:
- Create and publish standardized assessment scales
- Design and distribute surveys based on these scales
- Collect and export participant responses
- Perform various types of statistical analyses
- Manage user credits for premium analysis features

## 🏗️ Architecture

This is a **Rails 8.0 API-only application** with the following key components:

### Models
- **User**: Manages authentication, roles (admin/researcher/student), and credit system
- **Scale**: Represents standardized assessment scales with unique identifiers
- **Survey**: Links scales to data collection instances
- **Response**: Stores participant answers and calculates scores
- **Analysis**: Performs statistical analyses with credit deduction

### API Endpoints (v1)

#### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create a new user

#### Scales
- `GET /api/v1/scales` - List all scales
- `POST /api/v1/scales` - Create a new scale
- `PATCH /api/v1/scales/:id/publish` - Publish a scale

#### Surveys
- `GET /api/v1/surveys` - List all surveys
- `POST /api/v1/surveys` - Create a new survey

#### Responses
- `POST /api/v1/responses` - Submit a response
- `GET /api/v1/responses/:id/export` - Export response data

#### Analyses
- `POST /api/v1/analyses` - Create and run an analysis
- `GET /api/v1/analyses/:id/report` - Generate analysis report

## 🛠️ Technology Stack

- **Ruby Version**: 3.x+ (recommended)
- **Rails Version**: 8.0.3
- **Database**: SQLite3 (development/test), PostgreSQL ready for production
- **Web Server**: Puma
- **Authentication**: BCrypt (has_secure_password)
- **Background Jobs**: Solid Queue
- **Caching**: Solid Cache
- **WebSockets**: Solid Cable
- **Deployment**: Kamal (Docker-based)

## 📋 Prerequisites

- Ruby 3.0 or higher
- Bundler gem
- SQLite3 (for development)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthcare_scale_platform
```

### 2. Install Dependencies

```bash
bundle install
```

### 3. Database Setup

Create and migrate the database:

```bash
rails db:create
rails db:migrate
```

Optionally, seed the database with sample data:

```bash
rails db:seed
```

### 4. Configuration

The application uses Rails credentials for sensitive data. The master key should be located at:
- `config/master.key`

If you need to edit credentials:

```bash
rails credentials:edit
```

### 5. Start the Server

```bash
rails server
```

Or use the development script:

```bash
bin/dev
```

The API will be available at `http://localhost:3000`

## 🧪 Running Tests

Execute the test suite with:

```bash
rails test
```

Run specific tests:

```bash
rails test test/models/user_test.rb
rails test test/controllers/api/v1/users_controller_test.rb
```

## 📊 Database Schema

### Users Table
- `email` (string, unique)
- `password_digest` (string)
- `role` (string: admin/researcher/student)
- `credits` (integer)

### Scales Table
- `user_id` (foreign key)
- `title` (string)
- `description` (text)
- `identifier` (string, unique, auto-generated)
- `version` (string)
- `status` (string)

### Surveys Table
- `scale_id` (foreign key)
- `user_id` (foreign key)
- `title` (string)
- `status` (string)
- `response_count` (integer)

### Responses Table
- `survey_id` (foreign key)
- `participant_name` (string)
- `answers` (text)
- `submitted_at` (datetime)

### Analyses Table
- `survey_id` (foreign key)
- `user_id` (foreign key)
- `analysis_type` (string)
- `results` (text)
- `credits_used` (integer)

## 💳 Credit System

The platform uses a credit-based system for analyses:

| Analysis Type | Credits Required |
|--------------|------------------|
| Descriptive  | 5 credits       |
| Correlation  | 10 credits      |
| Factor       | 15 credits      |

Users must have sufficient credits before performing analyses.

## 🔒 Security Features

- Password encryption using BCrypt
- Role-based access control (admin, researcher, student)
- Parameter filtering for sensitive data
- CORS configuration available in `config/initializers/cors.rb`
- Static security analysis with Brakeman

## 🐳 Docker Deployment

The application includes Docker support with Kamal for deployment:

```bash
kamal setup
kamal deploy
```

See `config/deploy.yml` for deployment configuration.

## 📁 Project Structure

```
app/
├── controllers/api/v1/    # API versioned controllers
├── models/                # ActiveRecord models
├── jobs/                  # Background jobs
└── mailers/              # Email mailers

config/
├── environments/         # Environment-specific configs
├── initializers/        # App initialization code
└── routes.rb           # API routes definition

db/
├── migrate/            # Database migrations
└── schema.rb          # Current database schema

test/
├── controllers/       # Controller tests
├── models/           # Model tests
└── fixtures/        # Test data
```

## 🔧 Development Tools

- **Brakeman**: Security vulnerability scanning
- **RuboCop**: Code style checking (Rails Omakase style guide)
- **Debug**: Interactive debugging
- **Bootsnap**: Boot time optimization

Run code analysis:

```bash
bin/brakeman
bin/rubocop
```

## 📝 API Usage Examples

### Create a User

```bash
POST /api/v1/users
Content-Type: application/json

{
  "email": "researcher@example.com",
  "password": "secure_password",
  "role": "researcher",
  "credits": 100
}
```

### Create a Scale

```bash
POST /api/v1/scales
Content-Type: application/json

{
  "title": "Depression Assessment Scale",
  "description": "A standardized tool for assessing depression",
  "version": "1.0"
}
```

### Submit a Response

```bash
POST /api/v1/responses
Content-Type: application/json

{
  "survey_id": 1,
  "participant_name": "John Doe",
  "answers": "1,3,2,4,3,2,1",
  "submitted_at": "2025-10-21T10:30:00Z"
}
```

### Run an Analysis

```bash
POST /api/v1/analyses
Content-Type: application/json

{
  "survey_id": 1,
  "analysis_type": "descriptive"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a software implementation and testing course.

## 👥 Support

For questions or issues, please open an issue in the repository or contact the development team.

## 🔄 Changelog

### Version 1.0.0 (October 2025)
- Initial release
- User authentication and role management
- Scale creation and publishing
- Survey management
- Response collection and export
- Statistical analysis with credit system
- RESTful API with versioning (v1)
