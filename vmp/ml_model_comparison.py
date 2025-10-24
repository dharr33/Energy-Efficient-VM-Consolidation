"""
Comprehensive Machine Learning Model Comparison for VM Placement
This script trains and compares multiple ML models for VM placement optimization.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import warnings
warnings.filterwarnings('ignore')

class MLModelComparison:
    def __init__(self, data_path="vm_metrics.csv"):
        """Initialize the ML comparison class"""
        self.data_path = data_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.models = {}
        self.results = {}
        self.feature_importance = {}
        
    def load_and_preprocess_data(self):
        """Load and preprocess the dataset"""
        print("Loading and preprocessing data...")
        
        # Load the dataset
        try:
            self.df = pd.read_csv(self.data_path)
            print(f"Dataset loaded successfully: {self.df.shape}")
        except FileNotFoundError:
            print("Dataset not found. Generating synthetic data...")
            self.generate_synthetic_data()
        
        # Display basic info
        print(f"Dataset shape: {self.df.shape}")
        print(f"Columns: {list(self.df.columns)}")
        print(f"Missing values: {self.df.isnull().sum().sum()}")
        
        # Feature engineering
        self.prepare_features()
        
        # Split the data
        self.split_data()
        
    def generate_synthetic_data(self):
        """Generate synthetic VM metrics data if dataset is not available"""
        print("Generating synthetic VM metrics data...")
        
        np.random.seed(42)
        n_samples = 10000
        
        # Generate synthetic data
        data = {
            'timestamp': np.random.uniform(1600000000, 1700000000, n_samples),
            'vm': [f'VM{i%10+1}' for i in range(n_samples)],
            'cpu': np.random.randint(10, 91, n_samples),
            'memory': np.random.randint(1, 33, n_samples),
            'network_io': np.random.uniform(0.1, 5.0, n_samples),
            'power': np.random.randint(100, 301, n_samples)
        }
        
        # Assign hosts based on resource requirements
        hosts = []
        for i in range(n_samples):
            cpu = data['cpu'][i]
            memory = data['memory'][i]
            
            if cpu <= 33 and memory <= 11:
                hosts.append('Host1')
            elif cpu <= 66 and memory <= 22:
                hosts.append('Host2')
            else:
                hosts.append('Host3')
        
        data['host'] = hosts
        self.df = pd.DataFrame(data)
        
        # Save the synthetic data
        self.df.to_csv(self.data_path, index=False)
        print(f"Synthetic dataset generated and saved: {self.df.shape}")
    
    def prepare_features(self):
        """Prepare features for machine learning"""
        print("Preparing features...")
        
        # Create additional features
        self.df['cpu_memory_ratio'] = self.df['cpu'] / (self.df['memory'] + 1)
        self.df['resource_intensity'] = (self.df['cpu'] + self.df['memory']) / 2
        self.df['power_efficiency'] = self.df['power'] / (self.df['cpu'] + 1)
        
        # Encode categorical variables
        categorical_columns = ['vm', 'host']
        for col in categorical_columns:
            if col in self.df.columns:
                le = LabelEncoder()
                self.df[f'{col}_encoded'] = le.fit_transform(self.df[col])
                self.label_encoders[col] = le
        
        # Select features for training
        feature_columns = ['cpu', 'memory', 'network_io', 'power', 'cpu_memory_ratio', 
                          'resource_intensity', 'power_efficiency', 'vm_encoded']
        
        # Remove any columns that don't exist
        feature_columns = [col for col in feature_columns if col in self.df.columns]
        
        self.X = self.df[feature_columns]
        self.y = self.df['host_encoded'] if 'host_encoded' in self.df.columns else self.df['host']
        
        print(f"Features selected: {feature_columns}")
        print(f"Target variable: host placement")
    
    def split_data(self):
        """Split data into training and testing sets"""
        print("Splitting data into train/test sets...")
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=0.2, random_state=42, stratify=self.y
        )
        
        # Scale the features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"Training set: {self.X_train.shape}")
        print(f"Testing set: {self.X_test.shape}")
    
    def initialize_models(self):
        """Initialize all machine learning models"""
        print("Initializing machine learning models...")
        
        self.models = {
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'XGBoost': xgb.XGBRegressor(n_estimators=100, random_state=42),
            'K-Nearest Neighbors': KNeighborsRegressor(n_neighbors=5),
            'Support Vector Regression': SVR(kernel='rbf'),
            'Decision Tree': DecisionTreeRegressor(random_state=42),
            'Neural Network': MLPRegressor(hidden_layer_sizes=(100, 50), max_iter=500, random_state=42)
        }
    
    def train_models(self):
        """Train all models"""
        print("Training all models...")
        
        for name, model in self.models.items():
            print(f"Training {name}...")
            
            # Use scaled data for models that benefit from it
            if name in ['K-Nearest Neighbors', 'Support Vector Regression', 'Neural Network']:
                model.fit(self.X_train_scaled, self.y_train)
                y_pred = model.predict(self.X_test_scaled)
            else:
                model.fit(self.X_train, self.y_train)
                y_pred = model.predict(self.X_test)
            
            # Calculate metrics
            mse = mean_squared_error(self.y_test, y_pred)
            r2 = r2_score(self.y_test, y_pred)
            mae = mean_absolute_error(self.y_test, y_pred)
            
            self.results[name] = {
                'MSE': mse,
                'R2': r2,
                'MAE': mae,
                'predictions': y_pred
            }
            
            print(f"{name} - MSE: {mse:.4f}, R2: {r2:.4f}, MAE: {mae:.4f}")
    
    def hyperparameter_tuning(self):
        """Perform hyperparameter tuning for each model"""
        print("Performing hyperparameter tuning...")
        
        # Define parameter grids
        param_grids = {
            'Random Forest': {
                'n_estimators': [50, 100, 200],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5, 10]
            },
            'Gradient Boosting': {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 5, 7]
            },
            'XGBoost': {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 5, 7]
            },
            'K-Nearest Neighbors': {
                'n_neighbors': [3, 5, 7, 9],
                'weights': ['uniform', 'distance']
            },
            'Support Vector Regression': {
                'C': [0.1, 1, 10, 100],
                'gamma': ['scale', 'auto', 0.001, 0.01]
            },
            'Decision Tree': {
                'max_depth': [5, 10, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        }
        
        tuned_models = {}
        
        for name, param_grid in param_grids.items():
            print(f"Tuning {name}...")
            
            if name in ['K-Nearest Neighbors', 'Support Vector Regression']:
                # Use scaled data for these models
                grid_search = GridSearchCV(
                    self.models[name], param_grid, cv=3, scoring='r2', n_jobs=-1
                )
                grid_search.fit(self.X_train_scaled, self.y_train)
                tuned_models[name] = grid_search.best_estimator_
            else:
                grid_search = GridSearchCV(
                    self.models[name], param_grid, cv=3, scoring='r2', n_jobs=-1
                )
                grid_search.fit(self.X_train, self.y_train)
                tuned_models[name] = grid_search.best_estimator_
            
            print(f"Best parameters for {name}: {grid_search.best_params_}")
            print(f"Best cross-validation score: {grid_search.best_score_:.4f}")
        
        # Update models with tuned versions
        self.models.update(tuned_models)
    
    def evaluate_models(self):
        """Evaluate all models and create visualizations"""
        print("Evaluating models and creating visualizations...")
        
        # Create results DataFrame
        results_df = pd.DataFrame({
            name: {
                'MSE': results['MSE'],
                'R2': results['R2'],
                'MAE': results['MAE']
            }
            for name, results in self.results.items()
        }).T
        
        # Create visualizations
        self.create_performance_plots(results_df)
        self.create_feature_importance_plot()
        
        return results_df
    
    def create_performance_plots(self, results_df):
        """Create performance comparison plots"""
        print("Creating performance comparison plots...")
        
        # Set up the plotting style
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Machine Learning Models Performance Comparison', fontsize=16, fontweight='bold')
        
        # MSE comparison
        axes[0, 0].bar(results_df.index, results_df['MSE'], color='skyblue', alpha=0.7)
        axes[0, 0].set_title('Mean Squared Error (Lower is Better)', fontweight='bold')
        axes[0, 0].set_ylabel('MSE')
        axes[0, 0].tick_params(axis='x', rotation=45)
        
        # R² comparison
        axes[0, 1].bar(results_df.index, results_df['R2'], color='lightgreen', alpha=0.7)
        axes[0, 1].set_title('R² Score (Higher is Better)', fontweight='bold')
        axes[0, 1].set_ylabel('R² Score')
        axes[0, 1].tick_params(axis='x', rotation=45)
        
        # MAE comparison
        axes[1, 0].bar(results_df.index, results_df['MAE'], color='lightcoral', alpha=0.7)
        axes[1, 0].set_title('Mean Absolute Error (Lower is Better)', fontweight='bold')
        axes[1, 0].set_ylabel('MAE')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # Combined metrics radar chart
        metrics = ['MSE', 'R2', 'MAE']
        x = np.arange(len(results_df.index))
        width = 0.25
        
        for i, metric in enumerate(metrics):
            axes[1, 1].bar(x + i*width, results_df[metric], width, 
                          label=metric, alpha=0.7)
        
        axes[1, 1].set_title('Combined Metrics Comparison', fontweight='bold')
        axes[1, 1].set_ylabel('Score')
        axes[1, 1].set_xticks(x + width)
        axes[1, 1].set_xticklabels(results_df.index, rotation=45)
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig('model_performance_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Print best performing model
        best_model = results_df['R2'].idxmax()
        print(f"\nBest performing model: {best_model}")
        print(f"R² Score: {results_df.loc[best_model, 'R2']:.4f}")
    
    def create_feature_importance_plot(self):
        """Create feature importance plot for Random Forest"""
        print("Creating feature importance plot...")
        
        if 'Random Forest' in self.models:
            rf_model = self.models['Random Forest']
            feature_importance = rf_model.feature_importances_
            feature_names = self.X.columns
            
            # Create feature importance DataFrame
            importance_df = pd.DataFrame({
                'feature': feature_names,
                'importance': feature_importance
            }).sort_values('importance', ascending=True)
            
            # Plot feature importance
            plt.figure(figsize=(10, 8))
            plt.barh(importance_df['feature'], importance_df['importance'], color='steelblue', alpha=0.7)
            plt.title('Random Forest Feature Importance', fontsize=14, fontweight='bold')
            plt.xlabel('Importance Score')
            plt.ylabel('Features')
            plt.grid(axis='x', alpha=0.3)
            
            # Add value labels on bars
            for i, v in enumerate(importance_df['importance']):
                plt.text(v + 0.001, i, f'{v:.3f}', va='center')
            
            plt.tight_layout()
            plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
            plt.show()
            
            print("Feature importance (Random Forest):")
            for feature, importance in zip(importance_df['feature'], importance_df['importance']):
                print(f"{feature}: {importance:.4f}")
    
    def save_models(self):
        """Save trained models"""
        print("Saving trained models...")
        
        for name, model in self.models.items():
            filename = f"models/{name.lower().replace(' ', '_')}_model.pkl"
            joblib.dump(model, filename)
            print(f"Saved {name} model to {filename}")
    
    def run_complete_analysis(self):
        """Run the complete ML analysis pipeline"""
        print("Starting complete ML model comparison analysis...")
        print("=" * 60)
        
        # Load and preprocess data
        self.load_and_preprocess_data()
        print("\n" + "=" * 60)
        
        # Initialize models
        self.initialize_models()
        print("\n" + "=" * 60)
        
        # Train models
        self.train_models()
        print("\n" + "=" * 60)
        
        # Hyperparameter tuning
        self.hyperparameter_tuning()
        print("\n" + "=" * 60)
        
        # Retrain with tuned parameters
        self.train_models()
        print("\n" + "=" * 60)
        
        # Evaluate models
        results_df = self.evaluate_models()
        print("\n" + "=" * 60)
        
        # Save models
        self.save_models()
        print("\n" + "=" * 60)
        
        print("Analysis complete! Check the generated plots and model files.")
        return results_df

def main():
    """Main function to run the ML comparison"""
    # Create models directory if it doesn't exist
    import os
    os.makedirs('models', exist_ok=True)
    
    # Initialize and run the comparison
    ml_comparison = MLModelComparison()
    results = ml_comparison.run_complete_analysis()
    
    # Display final results
    print("\nFinal Results Summary:")
    print(results.round(4))

if __name__ == "__main__":
    main()
