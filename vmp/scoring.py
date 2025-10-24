def score_hosts(hosts_df, vm, weights):
    """
    Select the best host for a VM based on weighted cost, energy, and CPU usage.

    hosts_df: pandas DataFrame with hosts info (cpu_capacity, ram_capacity, energy, cost)
    vm: pandas Series representing a VM with cpu_demand and ram_demand
    weights: dict of weights for 'cpu', 'energy', and 'cost'

    Returns the host_id string of the best host or None if no suitable host is found.
    """
    best_score = float('inf')
    best_host = None

    for _, host in hosts_df.iterrows():
        # Filter hosts that cannot fulfill VM's resource demands
        if host["cpu_capacity"] < vm["cpu_demand"] or host["ram_capacity"] < vm["ram_demand"]:
            continue

        # Compute individual scores (normalize CPU demand relative to capacity)
        cpu_score = vm["cpu_demand"] / host["cpu_capacity"]
        energy_score = host["energy"]
        cost_score = host["cost"]

        # Weighted sum
        total_score = (
            weights["cpu"] * cpu_score +
            weights["energy"] * energy_score +
            weights["cost"] * cost_score
        )

        if total_score < best_score:
            best_score = total_score
            best_host = host["host_id"]

    return best_host
