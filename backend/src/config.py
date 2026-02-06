from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Azure OpenAI
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-12-01-preview"

    # Bing Search
    bing_subscription_key: str = ""

    # Azure Communication Services
    azure_communication_connection_string: str = ""
    azure_communication_sender: str = ""
    lead_email_recipient: str = "data.team@samhoud.com"

    # Frontend
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
