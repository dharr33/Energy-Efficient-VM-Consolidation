import streamlit as st
import pandas as pd
import joblib

# ----------------------
# Load saved model, scaler, and VM encoder
# ----------------------
model = joblib.load("/Users/DELL/Desktop/cad_project-main/cad_project-main/vmp/rfinal_vm_host_placement_model.pkl")
scaler = joblib.load("/Users/DELL/Desktop/cad_project-main/cad_project-main/vmp/vm_feature_scaler.pkl")
le_vm = joblib.load("/Users/DELL/Desktop/cad_project-main/cad_project-main/vmp/label_encoder_host.pkl")

# ----------------------
# Streamlit UI
# ----------------------
st.title("VM Host Placement Predictor")
st.write("Enter VM metrics to predict which host it should run on:")

# Input fields
vm_list = le_vm.classes_.tolist()  # list of known VMs
vm_input = st.selectbox("Select VM", vm_list)

cpu_input = st.slider("CPU usage (%)", 0, 100, 50)
memory_input = st.slider("Memory usage (GB)", 1, 32, 16)
network_io_input = st.number_input("Network I/O (GB/s)", min_value=0.0, max_value=10.0, value=1.0, step=0.01)
power_input = st.number_input("Power (Watts)", min_value=50, max_value=500, value=150)

# ----------------------
# Prediction button
# ----------------------
if st.button("Predict Host"):
    # Encode VM
    vm_encoded = le_vm.transform([vm_input])[0]

    # Prepare feature dataframe
    df_input = pd.DataFrame({
        'vm': [vm_encoded],
        'cpu': [cpu_input],
        'memory': [memory_input],
        'network_io': [network_io_input],
        'power': [power_input],
        'cpu_mem_ratio': [cpu_input / memory_input],
        'power_per_cpu': [power_input / cpu_input if cpu_input != 0 else 0]
    })

    # Scale numeric features
    X_new_scaled = scaler.transform(df_input)

    # Predict host directly (model outputs host names)
    pred_host = model.predict(X_new_scaled)
    st.success(f"Predicted Host: {pred_host[0]}")

    # Optional: display entered metrics
    st.subheader("Entered VM metrics:")
    st.write({
        "VM": vm_input,
        "CPU (%)": cpu_input,
        "Memory (GB)": memory_input,
        "Network I/O (GB/s)": network_io_input,
        "Power (Watts)": power_input
    })
