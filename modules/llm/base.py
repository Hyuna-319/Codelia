from abc import ABC, abstractmethod

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    def generate(self, system_prompt: str, user_message: str) -> str:
        """Generate response from LLM"""
        pass
