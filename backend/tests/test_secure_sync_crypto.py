"""
Tests for secure_sync.py crypto implementation

Validates:
- AES-GCM encryption/decryption roundtrip
- Wrong key fails with exception
- Tampered ciphertext fails with exception
- Environment variable handling
- Key derivation (PBKDF2HMAC)
"""

import pytest
import base64
import os
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.ai.federated.secure_sync import SecureSync


class TestSecureSyncCrypto:
    """Test SecureSync encryption/decryption"""
    
    def setup_method(self):
        """Clear environment before each test"""
        # Clear any existing federated env vars
        for key in ['FEDERATED_AES_KEY', 'FEDERATED_MASTER_SECRET', 'FEDERATED_SALT']:
            if key in os.environ:
                del os.environ[key]
    
    def test_encrypt_decrypt_roundtrip(self):
        """Test that encrypted data can be decrypted correctly"""
        # Set test environment variables
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-secret-key-for-unit-tests'
        os.environ['FEDERATED_SALT'] = 'a' * 32  # 16 bytes hex
        
        sync = SecureSync()
        
        # Test data
        model_data = {
            "weights": [[0.1, 0.2], [0.3, 0.4]],
            "bias": [0.5, 0.6],
            "metadata": {
                "version": "1.0",
                "timestamp": "2025-10-10T12:00:00"
            }
        }
        
        # Encrypt
        encrypted = sync.encrypt_model_update(model_data)
        
        # Verify structure
        assert "ciphertext" in encrypted
        assert "nonce" in encrypted
        assert "algorithm" in encrypted
        assert encrypted["algorithm"] == "AES-GCM-256"
        
        # Decrypt
        decrypted = sync.decrypt_model_update(encrypted)
        
        # Verify roundtrip
        assert decrypted == model_data
        
    def test_wrong_key_fails(self):
        """Test that decryption with wrong key fails"""
        # Encrypt with one key
        os.environ['FEDERATED_MASTER_SECRET'] = 'correct-key'
        os.environ['FEDERATED_SALT'] = 'a' * 32
        
        sync1 = SecureSync()
        model_data = {"test": "data"}
        encrypted = sync1.encrypt_model_update(model_data)
        
        # Try to decrypt with different key
        os.environ['FEDERATED_MASTER_SECRET'] = 'wrong-key'
        os.environ['FEDERATED_SALT'] = 'b' * 32  # Different salt
        
        sync2 = SecureSync()
        
        with pytest.raises(ValueError, match="Decryption failed"):
            sync2.decrypt_model_update(encrypted)
    
    def test_tampered_ciphertext_fails(self):
        """Test that tampered ciphertext fails authentication"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-key'
        os.environ['FEDERATED_SALT'] = 'a' * 32
        
        sync = SecureSync()
        model_data = {"test": "data"}
        encrypted = sync.encrypt_model_update(model_data)
        
        # Tamper with ciphertext
        ct_bytes = base64.b64decode(encrypted["ciphertext"])
        tampered = ct_bytes[:-1] + b'\x00'  # Flip last byte
        encrypted["ciphertext"] = base64.b64encode(tampered).decode()
        
        with pytest.raises(ValueError, match="Decryption failed"):
            sync.decrypt_model_update(encrypted)
    
    def test_missing_master_secret_raises_error(self):
        """Test that missing FEDERATED_MASTER_SECRET raises ValueError"""
        # Clear environment
        if 'FEDERATED_MASTER_SECRET' in os.environ:
            del os.environ['FEDERATED_MASTER_SECRET']
        if 'FEDERATED_AES_KEY' in os.environ:
            del os.environ['FEDERATED_AES_KEY']
        
        with pytest.raises(ValueError, match="FEDERATED_MASTER_SECRET"):
            SecureSync()
    
    def test_missing_salt_raises_error(self):
        """Test that missing FEDERATED_SALT raises ValueError when using PBKDF2"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-key'
        if 'FEDERATED_SALT' in os.environ:
            del os.environ['FEDERATED_SALT']
        if 'FEDERATED_AES_KEY' in os.environ:
            del os.environ['FEDERATED_AES_KEY']
        
        with pytest.raises(ValueError, match="FEDERATED_SALT"):
            SecureSync()
    
    def test_pre_derived_aes_key(self):
        """Test using pre-derived AES key (Option 1)"""
        # Generate a valid 32-byte key
        import secrets
        key = secrets.token_bytes(32)
        key_b64 = base64.b64encode(key).decode()
        
        os.environ['FEDERATED_AES_KEY'] = key_b64
        os.environ['FEDERATED_MASTER_SECRET'] = 'ignored'
        
        sync = SecureSync()
        
        # Test encryption/decryption works
        model_data = {"test": "data with pre-derived key"}
        encrypted = sync.encrypt_model_update(model_data)
        decrypted = sync.decrypt_model_update(encrypted)
        
        assert decrypted == model_data
    
    def test_invalid_aes_key_size_fails(self):
        """Test that FEDERATED_AES_KEY with wrong size fails"""
        # 16-byte key (should be 32 bytes)
        wrong_key = base64.b64encode(b'a' * 16).decode()
        
        os.environ['FEDERATED_AES_KEY'] = wrong_key
        os.environ['FEDERATED_MASTER_SECRET'] = 'ignored'
        
        with pytest.raises(ValueError, match="32 bytes"):
            SecureSync()
    
    def test_secure_package_creation(self):
        """Test create_secure_package includes all required fields"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-key'
        os.environ['FEDERATED_SALT'] = 'a' * 32
        
        sync = SecureSync()
        model_data = {
            "weights": [[1.0, 2.0]],
            "timestamp": "2025-10-10T12:00:00"
        }
        
        package = sync.create_secure_package(model_data)
        
        # Verify all required fields
        assert "ciphertext" in package
        assert "nonce" in package
        assert "hash" in package
        assert "algorithm" in package
        assert "timestamp" in package
        assert "kdf" in package
        
        assert package["algorithm"] == "AES-GCM-256"
        assert package["kdf"] == "PBKDF2-SHA256-100k"
        assert package["timestamp"] == "2025-10-10T12:00:00"
    
    def test_verify_integrity(self):
        """Test integrity verification with SHA-256 hash"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-key'
        os.environ['FEDERATED_SALT'] = 'a' * 32
        
        sync = SecureSync()
        model_data = {"weights": [[1.0, 2.0]]}
        
        # Create package to get hash
        package = sync.create_secure_package(model_data)
        expected_hash = package["hash"]
        
        # Verify correct hash
        assert sync.verify_integrity(model_data, expected_hash) is True
        
        # Verify wrong hash
        assert sync.verify_integrity(model_data, "wrong_hash") is False
    
    def test_different_nonces_for_same_data(self):
        """Test that encrypting same data twice produces different ciphertexts (unique nonces)"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'test-key'
        os.environ['FEDERATED_SALT'] = 'a' * 32
        
        sync = SecureSync()
        model_data = {"test": "data"}
        
        encrypted1 = sync.encrypt_model_update(model_data)
        encrypted2 = sync.encrypt_model_update(model_data)
        
        # Nonces should be different
        assert encrypted1["nonce"] != encrypted2["nonce"]
        # Ciphertexts should be different
        assert encrypted1["ciphertext"] != encrypted2["ciphertext"]
        
        # But both should decrypt to same data
        assert sync.decrypt_model_update(encrypted1) == model_data
        assert sync.decrypt_model_update(encrypted2) == model_data


class TestSecureSyncIntegration:
    """Integration tests for SecureSync"""
    
    def setup_method(self):
        """Clear environment before each test"""
        # Clear any existing federated env vars
        for key in ['FEDERATED_AES_KEY', 'FEDERATED_MASTER_SECRET', 'FEDERATED_SALT']:
            if key in os.environ:
                del os.environ[key]
    
    def test_full_workflow(self):
        """Test complete encrypt -> transmit -> decrypt workflow"""
        os.environ['FEDERATED_MASTER_SECRET'] = 'production-secret-key'
        os.environ['FEDERATED_SALT'] = 'f' * 32
        
        # Sender
        sender_sync = SecureSync()
        original_data = {
            "model_id": "ocr_v1",
            "updates": {
                "layer1": [[0.1, 0.2], [0.3, 0.4]],
                "layer2": [[0.5, 0.6]]
            },
            "metadata": {
                "device_id": "device123",
                "timestamp": "2025-10-10T12:00:00"
            }
        }
        
        # Encrypt and create secure package
        secure_package = sender_sync.create_secure_package(original_data)
        
        # Simulate transmission (convert to JSON and back)
        transmitted = json.loads(json.dumps(secure_package))
        
        # Receiver (same key)
        receiver_sync = SecureSync()
        
        # Decrypt
        decrypted_data = receiver_sync.decrypt_model_update({
            "ciphertext": transmitted["ciphertext"],
            "nonce": transmitted["nonce"]
        })
        
        # Verify integrity
        assert receiver_sync.verify_integrity(decrypted_data, transmitted["hash"])
        
        # Verify data matches
        assert decrypted_data == original_data

