import re
from typing import Dict, Tuple

class PIIRedactor:
    def __init__(self):
        # Maps token (e.g., [AADHAR_1]) to original value (e.g., 1234-5678-9012)
        self.mapping: Dict[str, str] = {}
        
        # Regex Patterns for Indian context
        # Aadhaar: 12 digits, often formatted as xxxx xxxx xxxx or xxxx-xxxx-xxxx
        self.aadhaar_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
        # PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
        self.pan_pattern = r'\b[A-Z]{5}\d{4}[A-Z]{1}\b'
        # Phone: Indian phone numbers starting with +91 or just 10 digits
        self.phone_pattern = r'\b(?:\+91[-\s]?)?[6789]\d{9}\b'
        # Email: Standard email regex
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        # Counters for tokens
        self.counters = {
            "AADHAR": 1,
            "PAN": 1,
            "PHONE": 1,
            "EMAIL": 1
        }
        
        # Reverse mapping to ensure consistent tokenization for the same entity
        self._value_to_token: Dict[str, str] = {}

    def _replace_match(self, match, token_prefix: str) -> str:
        original_value = match.group(0)
        
        if original_value in self._value_to_token:
            return self._value_to_token[original_value]
        
        token = f"[{token_prefix}_{self.counters[token_prefix]}]"
        self.counters[token_prefix] += 1
        
        self.mapping[token] = original_value
        self._value_to_token[original_value] = token
        
        return token

    def redact(self, text: str) -> str:
        if not text:
            return text
            
        redacted_text = text
        
        # Apply regex replacements sequentially
        redacted_text = re.sub(
            self.email_pattern, 
            lambda m: self._replace_match(m, "EMAIL"), 
            redacted_text
        )
        
        redacted_text = re.sub(
            self.pan_pattern, 
            lambda m: self._replace_match(m, "PAN"), 
            redacted_text
        )
        
        redacted_text = re.sub(
            self.aadhaar_pattern, 
            lambda m: self._replace_match(m, "AADHAR"), 
            redacted_text
        )
        
        redacted_text = re.sub(
            self.phone_pattern, 
            lambda m: self._replace_match(m, "PHONE"), 
            redacted_text
        )
        
        return redacted_text

    def restore(self, text: str) -> str:
        if not text:
            return text
            
        restored_text = text
        # Replace tokens back with their original values
        for token, original_value in self.mapping.items():
            restored_text = restored_text.replace(token, original_value)
            
        return restored_text
