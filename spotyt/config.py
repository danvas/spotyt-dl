from typing import Optional
from pydantic import BaseSettings
from enum import Enum

class RuntimeMode(str, Enum):
    development = 'development'
    production = 'production'

class Settings(BaseSettings):
    mode: Optional[RuntimeMode] = RuntimeMode.development
