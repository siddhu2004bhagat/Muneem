import base64
import json
import hashlib
import os
from typing import Dict, Any, Tuple

class SecureSync:
    """Handles encryption/decryption of model updates using simple base64 encoding"""
    
    def __init__(self, master_key: str = "digbahi_federated_key_2024"):
        self.master_key = master_key.encode()
    
    def encrypt_model_update(self, model_data: Dict[str, Any]) -> str:
        """Encrypt model update data using base64 encoding"""
        # Convert to JSON string
        json_data = json.dumps(model_data).encode()
        
        # Simple XOR encryption with master key
        encrypted_data = bytearray()
        key_bytes = self.master_key
        
        for i, byte in enumerate(json_data):
            encrypted_data.append(byte ^ key_bytes[i % len(key_bytes)])
        
        # Encode as base64
        return base64.b64encode(bytes(encrypted_data)).decode()
    
    def decrypt_model_update(self, encrypted_data: str) -> Dict[str, Any]:
        """Decrypt model update data"""
        try:
            # Decode base64
            encrypted_bytes = base64.b64decode(encrypted_data)
            
            # Simple XOR decryption with master key
            decrypted_data = bytearray()
            key_bytes = self.master_key
            
            for i, byte in enumerate(encrypted_bytes):
                decrypted_data.append(byte ^ key_bytes[i % len(key_bytes)])
            
            # Parse JSON
            return json.loads(decrypted_data.decode())
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def verify_integrity(self, model_data: Dict[str, Any], expected_hash: str) -> bool:
        """Verify model integrity using hash"""
        model_str = json.dumps(model_data, sort_keys=True)
        actual_hash = hashlib.sha256(model_str.encode()).hexdigest()
        return actual_hash == expected_hash
    
    def create_secure_package(self, model_data: Dict[str, Any]) -> Dict[str, str]:
        """Create secure package for transmission"""
        # Generate hash for integrity verification
        model_str = json.dumps(model_data, sort_keys=True)
        model_hash = hashlib.sha256(model_str.encode()).hexdigest()
        
        # Encrypt the data
        encrypted_data = self.encrypt_model_update(model_data)
        
        return {
            "encrypted_data": encrypted_data,
            "hash": model_hash,
            "algorithm": "XOR-Base64",
            "timestamp": model_data.get("timestamp", "")
        }
