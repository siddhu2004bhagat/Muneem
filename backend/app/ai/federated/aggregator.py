import json
import numpy as np
from typing import Dict, List, Any
from datetime import datetime
import hashlib

class FederatedAggregator:
    """Aggregates model updates using FedAvg algorithm"""
    
    def __init__(self):
        self.global_model = self._initialize_global_model()
        self.update_history = []
    
    def _initialize_global_model(self) -> Dict[str, Any]:
        """Initialize global model weights"""
        return {
            "anomaly_threshold": 0.5,
            "spending_patterns": np.random.random(10).tolist(),
            "category_weights": np.random.random(5).tolist(),
            "temporal_factors": np.random.random(7).tolist(),
            "version": "1.0.0",
            "aggregated_at": datetime.now().isoformat(),
            "update_count": 0
        }
    
    def aggregate_updates(self, client_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate client updates using FedAvg"""
        if not client_updates:
            return self.global_model
        
        # Verify all updates have same structure
        if not all("weights" in update for update in client_updates):
            raise ValueError("Invalid update format")
        
        # Extract weights from all clients
        client_weights = [update["weights"] for update in client_updates]
        
        # Federated Averaging
        aggregated_weights = {}
        
        # Average anomaly threshold
        thresholds = [w.get("anomaly_threshold", 0.5) for w in client_weights]
        aggregated_weights["anomaly_threshold"] = np.mean(thresholds)
        
        # Average spending patterns
        patterns = [w.get("spending_patterns", [0] * 10) for w in client_weights]
        if patterns:
            aggregated_weights["spending_patterns"] = np.mean(patterns, axis=0).tolist()
        
        # Average category weights
        categories = [w.get("category_weights", [0] * 5) for w in client_weights]
        if categories:
            aggregated_weights["category_weights"] = np.mean(categories, axis=0).tolist()
        
        # Average temporal factors
        temporal = [w.get("temporal_factors", [0] * 7) for w in client_weights]
        if temporal:
            aggregated_weights["temporal_factors"] = np.mean(temporal, axis=0).tolist()
        
        # Update metadata
        aggregated_weights["version"] = f"1.{len(self.update_history) + 1}.0"
        aggregated_weights["aggregated_at"] = datetime.now().isoformat()
        aggregated_weights["update_count"] = len(client_updates)
        aggregated_weights["client_count"] = len(client_updates)
        
        # Store update history
        self.update_history.append({
            "timestamp": datetime.now().isoformat(),
            "client_count": len(client_updates),
            "version": aggregated_weights["version"]
        })
        
        # Update global model
        self.global_model = aggregated_weights
        
        return self.global_model
    
    def get_global_model(self) -> Dict[str, Any]:
        """Get current global model"""
        return self.global_model
    
    def get_model_hash(self) -> str:
        """Generate hash for global model"""
        model_str = json.dumps(self.global_model, sort_keys=True)
        return hashlib.sha256(model_str.encode()).hexdigest()
    
    def get_update_summary(self) -> Dict[str, Any]:
        """Get summary of recent updates"""
        return {
            "global_model": self.global_model,
            "update_count": len(self.update_history),
            "last_update": self.update_history[-1] if self.update_history else None,
            "model_hash": self.get_model_hash()
        }
