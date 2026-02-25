from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    GEMINI_API_KEY: str = ""

    GROQ_API_KEY: str

    CRON_SECRET_TOKEN: str

    FRONTEND_URL: str = "http://localhost:3000"
    APP_URL: str = "http://localhost:8000"

    SLACK_BOT_TOKEN: str = ""
    SLACK_CLIENT_ID: str = ""
    SLACK_CLIENT_SECRET: str = ""
    SLACK_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/slack/oauth/callback"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/github/oauth/callback"
    GMAIL_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/gmail/oauth/callback"


settings = Settings()
