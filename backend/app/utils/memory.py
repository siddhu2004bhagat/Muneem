"""
Memory Management Utilities for Raspberry Pi
Monitors and optimizes memory usage for low-resource devices
"""

import psutil
import os
from typing import Dict, Optional

# Memory thresholds (in MB)
WARNING_THRESHOLD = 3200  # 80% of 4GB
CRITICAL_THRESHOLD = 3600  # 90% of 4GB


def get_memory_usage() -> Dict[str, float]:
    """
    Get current memory usage statistics
    
    Returns:
        {
            "total_mb": float,
            "available_mb": float,
            "used_mb": float,
            "percent": float,
            "status": "ok" | "warning" | "critical"
        }
    """
    mem = psutil.virtual_memory()
    
    status = "ok"
    if mem.percent >= 90:
        status = "critical"
    elif mem.percent >= 80:
        status = "warning"
    
    return {
        "total_mb": mem.total / (1024 * 1024),
        "available_mb": mem.available / (1024 * 1024),
        "used_mb": mem.used / (1024 * 1024),
        "percent": mem.percent,
        "status": status
    }


def check_memory_health() -> bool:
    """
    Check if system has sufficient memory
    
    Returns:
        True if memory is healthy, False otherwise
    """
    mem = get_memory_usage()
    return mem["status"] != "critical"


def get_process_memory(pid: Optional[int] = None) -> Dict[str, float]:
    """
    Get memory usage of current process or specified PID
    
    Args:
        pid: Process ID (None for current process)
    
    Returns:
        {
            "rss_mb": float,  # Resident Set Size
            "vms_mb": float,  # Virtual Memory Size
            "percent": float  # Percentage of total memory
        }
    """
    if pid is None:
        process = psutil.Process()
    else:
        process = psutil.Process(pid)
    
    mem_info = process.memory_info()
    
    return {
        "rss_mb": mem_info.rss / (1024 * 1024),
        "vms_mb": mem_info.vms / (1024 * 1024),
        "percent": process.memory_percent()
    }


def optimize_memory():
    """
    Attempt to free up memory (garbage collection, etc.)
    """
    import gc
    gc.collect()


def is_raspberry_pi() -> bool:
    """
    Detect if running on Raspberry Pi
    """
    try:
        with open('/proc/device-tree/model', 'r') as f:
            model = f.read()
            return 'Raspberry Pi' in model
    except:
        return False


def get_recommended_worker_count() -> int:
    """
    Get recommended number of Uvicorn workers based on available memory
    
    Returns:
        Number of workers (1 for Pi 4, 2 for Pi 5 with 8GB)
    """
    mem = get_memory_usage()
    total_gb = mem["total_mb"] / 1024
    
    if total_gb >= 8:
        return 2
    elif total_gb >= 4:
        return 1
    else:
        return 1  # Conservative for < 4GB

