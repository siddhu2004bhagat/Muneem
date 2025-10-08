import json
import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime
import hashlib
from ...db.models import LedgerEntry

class LocalTrainer:
    """Lightweight local trainer for on-device learning"""
    
    def __init__(self):
        self.model_version = "1.0.0"
        self.weights = self._initialize_weights()
    
    def _initialize_weights(self) -> Dict[str, Any]:
        """Initialize simple model weights"""
        return {
            "anomaly_threshold": 0.5,
            "spending_patterns": np.random.random(10).tolist(),
            "category_weights": np.random.random(5).tolist(),
            "temporal_factors": np.random.random(7).tolist(),
            "version": self.model_version,
            "trained_at": datetime.now().isoformat()
        }
    
    def train_locally(self, entries: List[LedgerEntry]) -> Dict[str, Any]:
        """Train model on local ledger data"""
        if not entries:
            return self.weights
        
        # Simple pattern learning from recent entries
        recent_entries = entries[-100:] if len(entries) > 100 else entries
        
        # Learn spending patterns
        daily_amounts = []
        for entry in recent_entries:
            if entry.amount:
                daily_amounts.append(abs(entry.amount))
        
        if daily_amounts:
            mean_amount = np.mean(daily_amounts)
            std_amount = np.std(daily_amounts)
            
            # Update anomaly threshold based on local data
            self.weights["anomaly_threshold"] = min(0.8, max(0.2, mean_amount / (mean_amount + std_amount)))
            
            # Update spending patterns
            if len(daily_amounts) >= 10:
                normalized_amounts = [(x - mean_amount) / std_amount for x in daily_amounts[-10:]]
                self.weights["spending_patterns"] = normalized_amounts
        
        # Learn category preferences
        category_counts = {}
        for entry in recent_entries:
            if entry.type:
                category_counts[entry.type] = category_counts.get(entry.type, 0) + 1
        
        total_entries = len(recent_entries)
        if total_entries > 0:
            category_weights = []
            for cat in ['sale', 'purchase', 'expense', 'receipt']:
                weight = category_counts.get(cat, 0) / total_entries
                category_weights.append(weight)
            self.weights["category_weights"] = category_weights
        
        # Update temporal factors (day of week patterns)
        day_patterns = [0] * 7
        for entry in recent_entries:
            try:
                date_obj = datetime.strptime(entry.date, '%Y-%m-%d')
                day_of_week = date_obj.weekday()
                day_patterns[day_of_week] += 1
            except:
                continue
        
        if sum(day_patterns) > 0:
            normalized_days = [d / sum(day_patterns) for d in day_patterns]
            self.weights["temporal_factors"] = normalized_days
        
        self.weights["trained_at"] = datetime.now().isoformat()
        return self.weights
    
    def get_model_hash(self) -> str:
        """Generate hash for model integrity verification"""
        model_str = json.dumps(self.weights, sort_keys=True)
        return hashlib.sha256(model_str.encode()).hexdigest()
    
    def export_weights(self) -> Dict[str, Any]:
        """Export weights for syncing"""
        return {
            "weights": self.weights,
            "hash": self.get_model_hash(),
            "device_id": "local_device",
            "timestamp": datetime.now().isoformat(),
            "model_version": self.model_version
        }
