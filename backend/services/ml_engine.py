import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

class MLEngine:
    """
    Live Machine Learning Pipeline using XGBoost to predict shipping delays.
    Features are taken from the Kaggle E-Commerce Shipping Dataset.
    """
    def __init__(self):
        self.is_trained = False
        self.model = None
        self.encoders = {}
        self.model_path = os.path.join(os.path.dirname(__file__), "xgboost_model.pkl")
        self.encoders_path = os.path.join(os.path.dirname(__file__), "encoders.pkl")
        
        # Try to load existing model
        if os.path.exists(self.model_path) and os.path.exists(self.encoders_path):
            try:
                self.model = joblib.load(self.model_path)
                self.encoders = joblib.load(self.encoders_path)
                self.is_trained = True
                print("Successfully loaded pre-trained XGBoost model.")
            except Exception as e:
                print(f"Error loading model: {e}")

    def train_on_dataset(self, csv_file_path: str):
        """
        Trains the XGBoost model on the Kaggle Dataset.
        Target: Reached.on.Time_Y.N (1 = Delayed, 0 = On Time)
        """
        if not os.path.exists(csv_file_path):
            return {"status": "failed", "reason": f"Dataset {csv_file_path} not found."}
        
        try:
            print("Loading dataset...")
            df = pd.read_csv(csv_file_path)
            
            # Drop ID 
            if 'ID' in df.columns:
                df = df.drop(columns=['ID'])
            
            # Identify categorical columns
            categorical_cols = ['Warehouse_block', 'Mode_of_Shipment', 'Product_importance', 'Gender']
            numeric_cols = ['Customer_care_calls', 'Customer_rating', 'Cost_of_the_Product', 
                           'Prior_purchases', 'Discount_offered', 'Weight_in_gms']
            
            # Filter to ensure all columns exist
            all_required = categorical_cols + numeric_cols + ['Reached.on.Time_Y.N']
            missing = [c for c in all_required if c not in df.columns]
            if missing:
                return {"status": "failed", "reason": f"Missing columns in dataset: {missing}"}

            # Encode categoricals using LabelEncoder
            for col in categorical_cols:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.encoders[col] = le
            
            X = df[categorical_cols + numeric_cols]
            y = df['Reached.on.Time_Y.N']
            
            # Simple test-train split just to tune/verify
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            print("Training XGBClassifier...")
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                eval_metric='logloss'
            )
            self.model.fit(X_train, y_train)
            
            # Calculate accuracy to return to user
            accuracy = self.model.score(X_test, y_test)
            
            # Save the model
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.encoders, self.encoders_path)
            
            self.is_trained = True
            
            return {
                "status": "success", 
                "message": "XGBoost model trained successfully!",
                "accuracy": f"{accuracy * 100:.2f}%",
                "records_trained": len(X_train)
            }
            
        except Exception as e:
            return {"status": "failed", "reason": str(e)}

    def predict_risk_score(self, shipment_features: dict) -> dict:
        """
        Predicts the risk of delay for a live shipment using the trained XGBoost model.
        Combines historical ML predictions with live weather/news penalties.
        """
        if not self.is_trained or self.model is None:
            return {"error": "Model has not been trained yet. Call /api/ml/train first."}
        
        # Build dummy feature vector using median/mode for missing live fields to make predictions work
        # In a real app we'd get these fields directly from the shipment tracker integration
        try:
            sample_features = {
                'Warehouse_block': shipment_features.get('Warehouse_block', 'F'),
                'Mode_of_Shipment': shipment_features.get('Mode_of_Shipment', 'Ship'),
                'Product_importance': shipment_features.get('Product_importance', 'medium'),
                'Gender': shipment_features.get('Gender', 'M'),
                'Customer_care_calls': shipment_features.get('Customer_care_calls', 4),
                'Customer_rating': shipment_features.get('Customer_rating', 3),
                'Cost_of_the_Product': shipment_features.get('Cost_of_the_Product', 210),
                'Prior_purchases': shipment_features.get('Prior_purchases', 3),
                'Discount_offered': shipment_features.get('Discount_offered', 10),
                'Weight_in_gms': shipment_features.get('Weight_in_gms', 3600)
            }
            
            df_input = pd.DataFrame([sample_features])
            
            # Encode categoricals using the saved encoders
            for col in ['Warehouse_block', 'Mode_of_Shipment', 'Product_importance', 'Gender']:
                # Handle unseen labels by defaulting to 0 or standardizing
                try:
                    df_input[col] = self.encoders[col].transform(df_input[col])
                except ValueError:
                    df_input[col] = 0 # Default if label unseen in training somehow
                    
            # Predict Probability of Delay (Class 1)
            # predict_proba returns [[prob_0, prob_1]]
            probabilities = self.model.predict_proba(df_input)
            base_risk = probabilities[0][1] * 100 # Convert to percentage
            
            # Dynamic Penalties from Live Data
            weather_penalty = 0
            condition = shipment_features.get("weather_condition", "").lower()
            if condition in ["rain", "storm", "cyclone", "snow", "thunderstorm"]:
                weather_penalty = 25
                
            news_penalty = 0
            if "strike" in shipment_features.get("recent_news_headline", "").lower() or \
               "delay" in shipment_features.get("recent_news_headline", "").lower():
                news_penalty = 25

            total_risk = min(100.0, base_risk + weather_penalty + news_penalty)

            return {
                "shipment_id": shipment_features.get("shipment_id", "LIVE-SHP"),
                "ai_risk_score": round(total_risk, 1),
                "interpretation": "Critical Alert" if total_risk >= 75 else "Warning" if total_risk >= 50 else "On Time",
                "features_used": {
                    "base_ml_risk": round(base_risk, 1),
                    "dynamic_weather_penalty": weather_penalty,
                    "dynamic_news_penalty": news_penalty
                }
            }
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

# Singleton instance
ml_pipeline = MLEngine()
