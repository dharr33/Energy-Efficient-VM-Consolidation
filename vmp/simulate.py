import pandas as pd

def generate_hosts(n=5):
    hosts = {
        "host_id": [f"H{i+1}" for i in range(n)],
        "cpu_capacity": [92, 63, 79, 78, 98][:n],
        "ram_capacity": [114, 102, 116, 100, 116][:n],
        "energy": [0.5986, 0.635, 0.532, 1.0421, 1.4076][:n],
        "cost": [0.3664, 0.3325, 0.7336, 0.3826, 0.2744][:n],
    }
    return pd.DataFrame(hosts)

def generate_vms(n=3):
    vms = {
        "vm_id": [f"VM{i+1}" for i in range(n)],
        "cpu_demand": [8, 16, 15][:n],
        "ram_demand": [24, 20, 22][:n],
    }
    return pd.DataFrame(vms)
