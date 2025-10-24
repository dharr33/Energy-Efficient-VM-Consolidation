import random
import time
import csv

hosts = ["Host1", "Host2", "Host3"]
vms = [f"VM{i}" for i in range(1, 11)]

with open("vm_metrics.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["timestamp", "vm", "host", "cpu", "memory", "network_io", "power"])

    for _ in range(100000):  # total records
        for vm in vms:
            cpu = random.randint(10, 90)      # CPU %
            memory = random.randint(1, 32)    # Memory GB
            network_io = random.uniform(0.1, 5.0)
            power = random.randint(100, 300)

            # Assign host based on rules
            if cpu <= 33 and memory <= 11:
                host = "Host1"
            elif cpu <= 66 and memory <= 22:
                host = "Host2"
            else:
                host = "Host3"

            row = [
                time.time(),
                vm,
                host,
                cpu,
                memory,
                network_io,
                power
            ]
            writer.writerow(row)
