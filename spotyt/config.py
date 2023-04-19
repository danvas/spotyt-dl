import os
from dotenv import load_dotenv
from enum import Enum
from typing import Optional
from pydantic import BaseSettings

load_dotenv()

class RuntimeMode(str, Enum):
    development = 'development'
    production = 'production'

class Settings(BaseSettings):
    mode: Optional[RuntimeMode] = RuntimeMode.development
    port: int = os.getenv("PORT", 80)
    host: str = os.getenv("HOST", "0.0.0.0")
