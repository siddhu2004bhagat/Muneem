import base64
import json
import hashlib
import os
import secrets
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class SecureSync:
    """Handles encryption/decryption of model updates using AES-GCM"""
    
    def __init__(self, master_key: str = None):
        """
        Initialize SecureSync with AES-GCM encryption.
        
        Args:
            master_key: Master password/key. If None, reads from FEDERATED_MASTER_SECRET env var.
        
        Raises:
            ValueError: If no master key provided and env var not set.
        """
        if not master_key:
            master_key = os.getenv('FEDERATED_MASTER_SECRET')
            if not master_key:
                raise ValueError(
                    "Master key required. Provide via constructor or set FEDERATED_MASTER_SECRET environment variable."
                )
        
        # Option 1: Use pre-derived AES key (recommended for production)
        # If FEDERATED_AES_KEY is set, use it directly (must be 32 bytes base64)
        pre_derived_key = os.getenv('FEDERATED_AES_KEY')
        if pre_derived_key:
            try:
                self.key = base64.b64decode(pre_derived_key)
                if len(self.key) != 32:
                    raise ValueError("FEDERATED_AES_KEY must be 32 bytes (base64 encoded)")
                self.aesgcm = AESGCM(self.key)
                return
            except Exception as e:
                raise ValueError(f"Invalid FEDERATED_AES_KEY: {e}")
        
        # Option 2: Derive key from master secret + salt (fallback)
        # Salt MUST be provided via environment variable (no hardcoded defaults)
        salt_hex = os.getenv('FEDERATED_SALT')
        if not salt_hex:
            raise ValueError(
                "FEDERATED_SALT environment variable required. "
                "Generate with: python -c 'import secrets; print(secrets.token_hex(16))'"
            )
        
        try:
            salt = bytes.fromhex(salt_hex)
            if len(salt) < 16:
                raise ValueError("Salt must be at least 16 bytes")
        except ValueError as e:
            raise ValueError(f"Invalid FEDERATED_SALT (must be hex string): {e}")
        
        # Derive 256-bit key from master secret using PBKDF2 with SHA-256
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits for AES-256
            salt=salt,
            iterations=100000,  # OWASP recommended minimum
        )
        self.key = kdf.derive(master_key.encode())
        self.aesgcm = AESGCM(self.key)
    
    def encrypt_model_update(self, model_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Encrypt model update data using AES-GCM.
        
        Args:
            model_data: Dictionary containing model weights/updates
        
        Returns:
            Dictionary with 'ciphertext', 'nonce', 'algorithm' keys
        """
        # Convert to JSON string
        json_data = json.dumps(model_data, sort_keys=True).encode()
        
        # Generate random 96-bit nonce (12 bytes) for GCM mode
        nonce = secrets.token_bytes(12)
        
        # Encrypt with AES-GCM (provides confidentiality + authentication)
        ciphertext = self.aesgcm.encrypt(nonce, json_data, None)
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode(),
            "nonce": base64.b64encode(nonce).decode(),
            "algorithm": "AES-GCM-256"
        }
    
    def decrypt_model_update(self, encrypted_package: Dict[str, str]) -> Dict[str, Any]:
        """
        Decrypt model update data.
        
        Args:
            encrypted_package: Dictionary with 'ciphertext' and 'nonce' keys
        
        Returns:
            Decrypted model data dictionary
        
        Raises:
            ValueError: If decryption fails (wrong key, tampered data, etc.)
        """
        try:
            # Decode base64
            ciphertext = base64.b64decode(encrypted_package['ciphertext'])
            nonce = base64.b64decode(encrypted_package['nonce'])
            
            # Decrypt and verify authentication tag
            plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)
            
            # Parse JSON
            return json.loads(plaintext.decode())
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}. Possible causes: wrong key, tampered data, or corrupted ciphertext.")
    
    def verify_integrity(self, model_data: Dict[str, Any], expected_hash: str) -> bool:
        """
        Verify model integrity using HMAC-SHA256.
        
        Args:
            model_data: Model data to verify
            expected_hash: Expected SHA-256 hash
        
        Returns:
            True if hashes match, False otherwise
        """
        model_str = json.dumps(model_data, sort_keys=True)
        actual_hash = hashlib.sha256(model_str.encode()).hexdigest()
        
        # Use constant-time comparison to prevent timing attacks
        return secrets.compare_digest(actual_hash, expected_hash)
    
    def create_secure_package(self, model_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Create secure package for transmission with encryption + integrity check.
        
        Args:
            model_data: Model weights/updates to encrypt
        
        Returns:
            Dictionary with encrypted data, hash, algorithm, timestamp
        """
        # Generate hash for integrity verification (before encryption)
        model_str = json.dumps(model_data, sort_keys=True)
        model_hash = hashlib.sha256(model_str.encode()).hexdigest()
        
        # Encrypt the data with AES-GCM
        encrypted_package = self.encrypt_model_update(model_data)
        
        return {
            "ciphertext": encrypted_package["ciphertext"],
            "nonce": encrypted_package["nonce"],
            "hash": model_hash,
            "algorithm": encrypted_package["algorithm"],
            "timestamp": model_data.get("timestamp", ""),
            "kdf": "PBKDF2-SHA256-100k"  # Document KDF parameters
        }
